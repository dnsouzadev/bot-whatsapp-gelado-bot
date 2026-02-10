import { sendReply } from '../services/evolutionApi.js';
import { clearAllUsage, checkAdmin } from '../services/imageRankService.js';

const clearCommand = async (message, instance) => {
    try {
        // Check if message is from bot itself (fromMe: true)
        const isFromBot = message.key.fromMe === true;
        const requesterNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const isAdmin = isFromBot || await checkAdmin(requesterNumber);
        
        console.log('🔍 CLEAR - message.key:', JSON.stringify(message.key));
        console.log('🔍 CLEAR - isFromBot:', isFromBot);
        
        if (!isAdmin) {
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
