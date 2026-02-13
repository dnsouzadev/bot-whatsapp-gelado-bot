import express from 'express';
import dotenv from 'dotenv';
import handleCommand from './commands/index.js';
import { sendMessage, sendReply } from './services/evolutionApi.js';
import { handleCreationStep } from './services/customCommandService.js';
import { handleCronStep } from './services/cronService.js';
import { handleImageRegistrationStep, handleReaction } from './services/imageRankService.js';

dotenv.config();

const app = express();
const webhookPayloadLimit = process.env.WEBHOOK_PAYLOAD_LIMIT || '1gb';
// Mantemos parser global bem pequeno para rotas comuns,
// mas pulamos no /webhook para evitar PayloadTooLarge antes do parser dedicado.
const defaultJsonParser = express.json({ limit: '1mb' });
const defaultUrlEncodedParser = express.urlencoded({ limit: '1mb', extended: true });

app.use((req, res, next) => {
    if (req.path === '/webhook') return next();
    return defaultJsonParser(req, res, next);
});

app.use((req, res, next) => {
    if (req.path === '/webhook') return next();
    return defaultUrlEncodedParser(req, res, next);
});

const PORT = process.env.PORT || 3000;


const unwrapMessageContent = (messageNode) => {
    if (!messageNode) return {};

    if (messageNode.ephemeralMessage?.message) {
        return unwrapMessageContent(messageNode.ephemeralMessage.message);
    }

    if (messageNode.viewOnceMessage?.message) {
        return unwrapMessageContent(messageNode.viewOnceMessage.message);
    }

    if (messageNode.viewOnceMessageV2?.message) {
        return unwrapMessageContent(messageNode.viewOnceMessageV2.message);
    }

    return messageNode;
};

const getMessageText = (messageNode) => {
    const content = unwrapMessageContent(messageNode);

    return content?.conversation ||
        content?.extendedTextMessage?.text ||
        content?.imageMessage?.caption ||
        content?.videoMessage?.caption ||
        content?.documentMessage?.caption ||
        content?.buttonsResponseMessage?.selectedDisplayText ||
        content?.listResponseMessage?.title ||
        '';
};

const normalizeIncomingMessage = (data) => {
    if (!data) return null;

    const queue = [data];
    const visited = new Set();

    while (queue.length > 0) {
        const candidate = queue.shift();
        if (!candidate) continue;

        if (typeof candidate === 'string') {
            const trimmed = candidate.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    queue.push(JSON.parse(trimmed));
                } catch (_) {
                    // ignore invalid JSON strings
                }
            }
            continue;
        }

        if (typeof candidate !== 'object') continue;
        if (visited.has(candidate)) continue;
        visited.add(candidate);

        if (candidate?.key && candidate?.message) {
            return candidate;
        }

        if (candidate?.message?.key && candidate?.message?.message) {
            return candidate.message;
        }

        // fallback comum para chats.upsert/chats.update com lastMessage
        if (candidate?.lastMessage?.message) {
            return {
                key: candidate.lastMessage.key || { remoteJid: candidate.id },
                message: candidate.lastMessage.message,
                messageType: candidate.lastMessage.messageType
            };
        }

        if (Array.isArray(candidate)) {
            queue.push(...candidate);
            continue;
        }

        const nestedKeys = ['data', 'payload', 'message', 'messages', 'lastMessage'];
        for (const key of nestedKeys) {
            if (candidate[key]) {
                queue.push(candidate[key]);
            }
        }

        for (const value of Object.values(candidate)) {
            if (value && (typeof value === 'object' || typeof value === 'string')) {
                queue.push(value);
            }
        }
    }

    return null;
};




const extractCommandFromChatUpdates = (data) => {
    if (!data || typeof data !== 'object') return null;

    const entries = Array.isArray(data)
        ? data
        : Object.values(data).filter((value) => value && typeof value === 'object');

    for (const entry of entries) {
        const remoteJid = entry?.id || entry?.remoteJid || entry?.lastMessage?.key?.remoteJid;
        if (!remoteJid || !remoteJid.endsWith('@g.us')) continue;

        const messageNode = entry?.lastMessage?.message || entry?.message;
        if (!messageNode) continue;

        const text = getMessageText(messageNode).trim();
        if (!text.startsWith('!')) continue;

        return {
            key: {
                remoteJid,
                id: entry?.lastMessage?.key?.id || `chat-${Date.now()}`,
                participant: entry?.lastMessage?.key?.participant,
                fromMe: entry?.lastMessage?.key?.fromMe || false
            },
            message: messageNode,
            messageType: entry?.lastMessage?.messageType
        };
    }

    return null;
};

const nonMessageEvents = new Set([
    'presence.update',
    'contacts.update',
    'chats.update',
    'chats.upsert',
    'labels.edit',
    'labels.association',
    'groups.upsert',
    'groups.update',
    'connection.update',
    'messages.update'
]);


// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'online', message: 'Bot WhatsApp está rodando!' });
});

const webhookParsers = [
    express.json({ limit: webhookPayloadLimit }),
    express.urlencoded({ limit: webhookPayloadLimit, extended: true })
];

// Webhook para receber mensagens do Evolution API
app.post('/webhook', webhookParsers, async (req, res) => {
    try {
        const { event, instance, data } = req.body;

        console.log('📨 Webhook recebido:', event);
        
        // Log completo para eventos de reação (debug)
        if (event && event.includes('reaction')) {
            console.log('🎯 EVENTO DE REAÇÃO DETECTADO!');
            console.log('Full webhook body:', JSON.stringify(req.body, null, 2));
        }

        // Responde rapidamente ao Evolution API
        res.status(200).json({ received: true });

        // Handle Reactions
        if (event === 'messages.reaction') {
            console.log('🎯 Reação recebida! Event data:', JSON.stringify(data, null, 2));
            await handleReaction(data, instance);
            return;
        }

        // Processa mensagens recebidas (suporta variações de evento/payload)
        const message = normalizeIncomingMessage(data) || normalizeIncomingMessage(req.body) || extractCommandFromChatUpdates(data);
        if (!message) {
            if (!nonMessageEvents.has(event)) {
                console.log('ℹ️ Evento sem payload de mensagem compatível. Event:', event, 'Chaves data:', Object.keys(data || {}), 'Chaves body:', Object.keys(req.body || {}), 'Tipo data[0]:', typeof data?.[0]);
            }
            return;
        }

        if (event !== 'messages.upsert' && event !== 'send.message') {
            console.log(`ℹ️ Evento ${event} continha mensagem e será processado.`);
        }

        // Check if it's a reaction
        const unwrappedMessage = unwrapMessageContent(message.message);
        const reactionMessage = unwrappedMessage?.reactionMessage;
        if (message.messageType === 'reactionMessage' || reactionMessage) {
            console.log('🎯 REAÇÃO DETECTADA!');
            const reactionData = {
                key: message.key,
                message: {
                    reaction: {
                        key: reactionMessage?.key,
                        text: reactionMessage?.text
                    }
                }
            };
            await handleReaction(reactionData, instance);
            return;
        }

        // Ignora mensagens do próprio bot
        // if (message.key.fromMe) return;

        // Ignora mensagens de status
        const remoteJid = message?.key?.remoteJid;
        if (!remoteJid) {
            console.log('ℹ️ Mensagem sem remoteJid, ignorando.');
            return;
        }

        if (remoteJid === 'status@broadcast') return;

        // Verifica se é um grupo (remoteJid termina com @g.us)
        const isGroup = remoteJid.endsWith('@g.us');

        if (!isGroup) {
            console.log('Mensagem ignorada: não é de um grupo');
            return;
        }

        // Pega o conteúdo da mensagem
        const messageContent = getMessageText(message.message).trim();

        console.log('Mensagem recebida:', messageContent);
        console.log('De:', remoteJid);

        // Verifica se o usuário está criando um comando personalizado
        const isCreating = await handleCreationStep(
            instance,
            remoteJid,
            message,
            message.key.id
        );

        if (isCreating) return;

        // Verifica se o usuário está configurando um cron
        const isCronSetup = await handleCronStep(
            instance,
            remoteJid,
            message,
            message.key.id
        );

        if (isCronSetup) return;

        // Verifica se o usuário está registrando imagem
        const isRegistering = await handleImageRegistrationStep(
            instance,
            remoteJid,
            message,
            message.key.id
        );

        if (isRegistering) return;

        // Verifica se é um comando (começa com !)
        if (messageContent.startsWith('!')) {
            const comando = messageContent
                .slice(1)
                .trim()
                .toLowerCase();

            if (!comando) {
                console.log('Comando vazio recebido após o prefixo "!", ignorando.');
                return;
            }

            console.log('Comando detectado:', comando);

            await handleCommand(message, comando, instance);
        }

        // Verifica se o bot foi mencionado
        //const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        //const botNumber = process.env.BOT_NUMBER; // Número do bot no formato 5511999999999

        //if (mentions.includes(`${botNumber}@s.whatsapp.net`)) {
         //   await sendReply(
         //       instance,
          //      message.key.remoteJid,
          //      "Desculpe, não comerei seu fundo",
           //     message.key.id
           // );
        //}

    } catch (error) {
        console.error('Erro ao processar webhook:', error);
    }
});

app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large' || error?.status === 413) {
        console.error('❌ Payload maior que o limite permitido:', error.message);
        return res.status(413).json({
            received: false,
            error: 'payload_too_large',
            message: `Payload excede o limite configurado (${webhookPayloadLimit}).`
        });
    }

    return next(error);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Webhook disponível em: http://localhost:${PORT}/webhook`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
