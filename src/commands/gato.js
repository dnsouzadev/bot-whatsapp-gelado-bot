import axios from 'axios';
import { sendImage, sendReply } from '../services/evolutionApi.js';

const gatoCommand = async (message, instance) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const catImageUrl = response.data[0].url;

        await sendImage(
            instance,
            message.key.remoteJid,
            catImageUrl,
            '🐱 Aqui está seu gatinho!'
        );
    } catch (error) {
        console.error('Erro ao buscar imagem de gato:', error);
        await sendReply(
            instance,
            message.key.remoteJid,
            'Desculpe, não consegui buscar uma imagem de gato no momento. Tente novamente.',
            message.key.id
        );
    }
};

export default gatoCommand;
