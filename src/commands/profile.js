import { sendReply } from '../services/evolutionApi.js';
import { getUserProfile } from '../services/imageRankService.js';

const profileCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const profile = await getUserProfile(userNumber);
        await sendReply(instance, message.key.remoteJid, profile, message.key.id);
    } catch (error) {
        console.error('Error in profile command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao buscar perfil.', message.key.id);
    }
};

export default profileCommand;
