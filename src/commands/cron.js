import { sendReply } from '../services/evolutionApi.js';
import { startCronSetup } from '../services/cronService.js';

const cronCommand = async (message, instance) => {
    try {
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '';
        
        const args = messageContent.trim().split(/\s+/);
        
        // args[0] is !cron, args[1] should be minutes
        if (args.length < 2) {
            await sendReply(instance, message.key.remoteJid, '⚠️ Uso correto: !cron [minutos]\nExemplo: !cron 5', message.key.id);
            return;
        }

        const minutes = parseInt(args[1]);

        if (isNaN(minutes) || minutes <= 0) {
            await sendReply(instance, message.key.remoteJid, '⚠️ Por favor, informe um número válido de minutos maior que zero.', message.key.id);
            return;
        }

        // Start the setup flow
        startCronSetup(message.key.remoteJid, minutes);

        await sendReply(
            instance,
            message.key.remoteJid,
            `⏳ Configurei o timer para ${minutes} minutos.\nAgora, envie a mensagem (texto ou sticker) que deseja agendar.`, 
            message.key.id
        );

    } catch (error) {
        console.error('Error in cron command:', error);
        await sendReply(instance, message.key.remoteJid, 'Ocorreu um erro ao tentar agendar.', message.key.id);
    }
};

export default cronCommand;
