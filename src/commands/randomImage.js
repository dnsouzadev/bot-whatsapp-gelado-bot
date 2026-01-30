import { sendReply } from '../services/evolutionApi.js';
import { sendRandomImage } from '../services/imageRankService.js';

const randomImageCommand = async (message, instance) => {
    try {
        const result = await sendRandomImage(instance, message.key.remoteJid);
        if (typeof result === 'string') {
             await sendReply(instance, message.key.remoteJid, result, message.key.id);
        }
    } catch (error) {
        console.error('Error random command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao buscar imagem.', message.key.id);
    }
};

export default randomImageCommand;
