import axios from 'axios';
import { sendSticker, sendReply, downloadMedia } from '../services/evolutionApi.js';

const stickerCommand = async (message, instance) => {
    try {
        const isImage = message.message?.imageMessage;
        const isVideo = message.message?.videoMessage;
        const isQuotedImage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isQuotedVideo = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

        if (!isImage && !isQuotedImage && !isVideo && !isQuotedVideo) {
            await sendReply(
                instance,
                message.key.remoteJid,
                'Por favor, envie uma imagem/gif/vídeo com o comando !sticker ou responda a uma mídia com o comando.',
                message.key.id
            );
            return;
        }

        let mediaMessage = message;

        if (isQuotedImage || isQuotedVideo) {
            const quotedContext = message.message.extendedTextMessage.contextInfo;
            // Constrói um objeto de mensagem simulado para o conteúdo citado
            mediaMessage = {
                key: {
                    remoteJid: message.key.remoteJid,
                    fromMe: false, 
                    id: quotedContext.stanzaId,
                    participant: quotedContext.participant // Importante para grupos
                },
                message: quotedContext.quotedMessage
            };
        }

        console.log('Baixando mídia...');

        // Usa a API do Evolution para obter o base64
        const result = await downloadMedia(instance, mediaMessage);

        console.log('Resultado downloadMedia:', result ? Object.keys(result) : 'null');
        
        if (!result || !result.base64) {
            throw new Error('Não foi possível obter o base64 da imagem.');
        }

        console.log('Mimetype:', result.mimetype);
        console.log('Base64 start:', result.base64.substring(0, 30));

        // Tenta usar o mimetype retornado, ou fallback para image/jpeg
        const mime = result.mimetype || 'image/jpeg';
        
        // Envia apenas o raw base64 para o endpoint sendSticker
        const stickerPayload = result.base64;

        // Envia como sticker
        await sendSticker(
            instance,
            message.key.remoteJid,
            stickerPayload
        );

    } catch (error) {
        console.error('Erro ao criar sticker:', error.message);
        await sendReply(
            instance,
            message.key.remoteJid,
            '❌ Erro ao criar sticker. Tente novamente.',
            message.key.id
        );
    }
};

export default stickerCommand;
