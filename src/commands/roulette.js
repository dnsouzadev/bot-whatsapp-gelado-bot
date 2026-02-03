import { sendReply } from '../services/evolutionApi.js';
import { playRoulette } from '../services/imageRankService.js';

const rouletteCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const result = await playRoulette(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in roulette command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao girar a roleta.', message.key.id);
    }
};

export default rouletteCommand;
