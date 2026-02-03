import { sendReply } from '../services/evolutionApi.js';
import { sendRandomImage } from '../services/imageRankService.js';

const randomImageCommand = async (message, instance) => {
    try {
        console.log('Executing randomImageCommand...');
        
        // Get user number (participant in groups, remoteJid in DMs)
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        console.log('🔍 RANDOM - userNumber extracted:', userNumber);
        
        const result = await sendRandomImage(instance, message.key.remoteJid, userNumber);
        console.log('Result from sendRandomImage:', result);
        
        if (typeof result === 'string') {
             await sendReply(instance, message.key.remoteJid, result, message.key.id);
        } else if (!result) {
            // If result is undefined/null/false but no error thrown, assume success (image sent) or unhandled case
            // But sendRandomImage usually returns void if it sends image, or string if error/limit
            // If it sends image, we don't need to reply text.
        }
    } catch (error) {
        console.error('Error random command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao buscar imagem.', message.key.id);
    }
};

export default randomImageCommand;
