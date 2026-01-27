import { downloadMedia, sendSticker, sendReply } from '../services/evolutionApi.js';

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

        // Se for imagem citada, precisamos do ID da mensagem citada
        const messageId = isQuotedImage 
            ? message.message.extendedTextMessage.contextInfo.stanzaId 
            : message.key.id;

        // Avisa que está processando (opcional)
        // await sendReply(instance, message.key.remoteJid, '⏳ Criando seu sticker...', message.key.id);

        const mediaData = await downloadMedia(instance, messageId);

        // A Evolution API costuma retornar { base64: "..." } ou o próprio base64
        const base64 = mediaData.base64 || mediaData;

        if (base64) {
            await sendSticker(
                instance,
                message.key.remoteJid,
                base64
            );
        } else {
            throw new Error('Não foi possível obter o Base64 da imagem');
        }

    } catch (error) {
        console.error('Erro ao criar sticker:', error);
        await sendReply(
            instance,
            message.key.remoteJid,
            '❌ Erro ao criar sticker. Verifique se a instância tem permissão para ler mídias.',
            message.key.id
        );
    }
};

export default stickerCommand;
