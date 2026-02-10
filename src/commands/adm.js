import { sendReply } from '../services/evolutionApi.js';
import { playAdminChallenge } from '../services/imageRankService.js';

const admCommand = async (message, instance, args) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const guess = args?.[0];
        const result = await playAdminChallenge(userNumber, guess);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in adm command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao tentar o desafio de admin.', message.key.id);
    }
};

export default admCommand;
