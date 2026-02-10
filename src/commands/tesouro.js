import { sendReply } from '../services/evolutionApi.js';
import { playTreasureChest } from '../services/imageRankService.js';

const tesouroCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const result = await playTreasureChest(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in tesouro command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao abrir o baú do tesouro.', message.key.id);
    }
};

export default tesouroCommand;
