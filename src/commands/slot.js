import { sendReply } from '../services/evolutionApi.js';
import { playSlotMachine } from '../services/imageRankService.js';

const slotCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const result = await playSlotMachine(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in slot command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao girar o slot.', message.key.id);
    }
};

export default slotCommand;
