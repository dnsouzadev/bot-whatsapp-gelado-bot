import express from 'express';
import dotenv from 'dotenv';
import handleCommand from './commands/index.js';
import { sendMessage, sendReply } from './services/evolutionApi.js';
import { handleCreationStep } from './services/customCommandService.js';
import { handleCronStep } from './services/cronService.js';
import { handleImageRegistrationStep, handleReaction } from './services/imageRankService.js';

dotenv.config();

const app = express();
const webhookPayloadLimit = process.env.WEBHOOK_PAYLOAD_LIMIT || '200mb';
app.use(express.json({ limit: webhookPayloadLimit }));
app.use(express.urlencoded({ limit: webhookPayloadLimit, extended: true }));

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



const nonMessageEvents = new Set([
    'presence.update',
    'contacts.update',
    'chats.update',
    'chats.upsert',
    'labels.edit',
    'labels.association',
    'groups.upsert',
    'groups.update',
    'connection.update'
]);


// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'online', message: 'Bot WhatsApp está rodando!' });
});

// Webhook para receber mensagens do Evolution API
app.post('/webhook', async (req, res) => {
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
        const message = normalizeIncomingMessage(data) || normalizeIncomingMessage(req.body);
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
            const comando = messageContent.slice(1).toLowerCase();
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
