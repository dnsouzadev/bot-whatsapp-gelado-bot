import express from 'express';
import dotenv from 'dotenv';
import handleCommand from './commands/index.js';
import { sendMessage, sendReply } from './services/evolutionApi.js';
import { handleCreationStep } from './services/customCommandService.js';
import { handleCronStep } from './services/cronService.js';
import { handleImageRegistrationStep, handleReaction } from './services/imageRankService.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

        // Processa apenas mensagens recebidas
        if (event !== 'messages.upsert') return;

        const message = data;
        
        // DEBUG: Log completo da mensagem para ver estrutura
        console.log('📋 MENSAGEM COMPLETA:', JSON.stringify(message, null, 2));

        // Ignora mensagens do próprio bot
        // if (message.key.fromMe) return;

        // Ignora mensagens de status
        if (message.key.remoteJid === 'status@broadcast') return;

        // Verifica se é um grupo (remoteJid termina com @g.us)
        const isGroup = message.key.remoteJid.endsWith('@g.us');

        if (!isGroup) {
            console.log('Mensagem ignorada: não é de um grupo');
            return;
        }

        // Pega o conteúdo da mensagem
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || 
                              message.message?.imageMessage?.caption || 
                              message.message?.videoMessage?.caption || '';

        console.log('Mensagem recebida:', messageContent);
        console.log('De:', message.key.remoteJid);

        // Verifica se o usuário está criando um comando personalizado
        const isCreating = await handleCreationStep(
            instance,
            message.key.remoteJid,
            message,
            message.key.id
        );

        if (isCreating) return;

        // Verifica se o usuário está configurando um cron
        const isCronSetup = await handleCronStep(
            instance,
            message.key.remoteJid,
            message,
            message.key.id
        );

        if (isCronSetup) return;

        // Verifica se o usuário está registrando imagem
        const isRegistering = await handleImageRegistrationStep(
            instance,
            message.key.remoteJid,
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

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Webhook disponível em: http://localhost:${PORT}/webhook`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
