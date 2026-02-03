import { sendReply, sendImage } from '../services/evolutionApi.js';
import { getLeaderboard } from '../services/imageRankService.js';

const imageRankCommand = async (message, instance) => {
    try {
        const result = await getLeaderboard();
        
        if (typeof result === 'string') {
            // Old format or empty
            await sendReply(instance, message.key.remoteJid, result, message.key.id);
        } else {
            // New format with top image
            if (result.topImage && result.topImage.base64) {
                // Send image with caption
                await sendImage(instance, message.key.remoteJid, result.topImage.base64, result.text);
            } else {
                // No image, just text
                await sendReply(instance, message.key.remoteJid, result.text, message.key.id);
            }
        }
    } catch (error) {
        console.error('Error rank command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao buscar ranking.', message.key.id);
    }
};

export default imageRankCommand;
