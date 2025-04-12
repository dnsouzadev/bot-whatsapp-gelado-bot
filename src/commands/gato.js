import axios from 'axios';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

const gatoCommand = async (msg) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const imagemGato = response.data[0].url;

        // Baixa a imagem
        const imageResponse = await axios.get(imagemGato, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // Cria o MessageMedia
        const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));

        // Envia a imagem
        await msg.reply(media, null, { caption: '🐱 *Aqui está um gatinho fofo para você!*' });
    } catch (error) {
        console.error('Erro ao buscar imagem de gato:', error);
        await msg.reply('❌ Desculpe, não consegui encontrar um gatinho agora. Tente novamente mais tarde!');
    }
};

export default gatoCommand;
