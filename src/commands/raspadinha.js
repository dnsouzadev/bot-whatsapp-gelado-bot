import { sendReply } from '../services/evolutionApi.js';
import { playScratchCard } from '../services/imageRankService.js';

const raspadinhaCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const result = await playScratchCard(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in raspadinha command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao usar a raspadinha.', message.key.id);
    }
};

export default raspadinhaCommand;
