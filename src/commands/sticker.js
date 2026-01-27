import axios from 'axios';
import { sendSticker, sendReply } from '../services/evolutionApi.js';

const stickerCommand = async (message, instance) => {
    try {
        const isImage = message.message?.imageMessage;
        const isQuotedImage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (!isImage && !isQuotedImage) {
            await sendReply(
                instance,
                message.key.remoteJid,
                'Por favor, envie uma imagem com o comando !sticker ou responda a uma imagem com o comando.',
                message.key.id
            );
            return;
        }

        // Pega a URL da imagem
        const imageUrl = isImage?.url || isQuotedImage?.url;

        if (!imageUrl) {
            throw new Error('URL da imagem não encontrada');
        }

        console.log('URL da imagem:', imageUrl);

        // Baixa a imagem e converte para base64
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000 // 30 segundos de timeout
        });

        // Converte para base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        const base64WithPrefix = `data:${mimeType};base64,${base64Image}`;

        // Envia como sticker
        await sendSticker(
            instance,
            message.key.remoteJid,
            base64WithPrefix
        );

    } catch (error) {
        console.error('Erro ao criar sticker:', error.message);
        await sendReply(
            instance,
            message.key.remoteJid,
            '❌ Erro ao criar sticker. A imagem pode ter expirado ou não está acessível.',
            message.key.id
        );
    }
};

export default stickerCommand;
