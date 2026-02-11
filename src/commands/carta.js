import { sendReply } from '../services/evolutionApi.js';
import { sendImageCard } from '../services/imageRankService.js';

const cartaCommand = async (message, instance, args) => {
    try {
        const rankPosition = args?.[0];
        const result = await sendImageCard(instance, message.key.remoteJid, rankPosition);
        if (result) {
            await sendReply(instance, message.key.remoteJid, result, message.key.id);
        }
    } catch (error) {
        console.error('Error in carta command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao mostrar a carta da imagem.', message.key.id);
    }
};

export default cartaCommand;
