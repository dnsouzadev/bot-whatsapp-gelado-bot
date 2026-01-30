import { sendReply } from '../services/evolutionApi.js';
import { getLeaderboard } from '../services/imageRankService.js';

const imageRankCommand = async (message, instance) => {
    try {
        const leaderboard = await getLeaderboard();
        await sendReply(instance, message.key.remoteJid, leaderboard, message.key.id);
    } catch (error) {
        console.error('Error rank command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao buscar ranking.', message.key.id);
    }
};

export default imageRankCommand;
