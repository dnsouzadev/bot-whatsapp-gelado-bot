import { sendReply } from '../services/evolutionApi.js';
import { clearAllUsage } from '../services/imageRankService.js';

const clearCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const botNumber = process.env.BOT_NUMBER;
        
        // Check if user is the bot
        if (userNumber !== botNumber) {
            await sendReply(
                instance, 
                message.key.remoteJid, 
                '🚫 Apenas o administrador do bot pode usar este comando.', 
                message.key.id
            );
            return;
        }
        
        const result = await clearAllUsage();
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in clear command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao executar reset.', message.key.id);
    }
};

export default clearCommand;
