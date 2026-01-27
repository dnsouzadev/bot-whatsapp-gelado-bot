import { downloadMedia, sendSticker, sendReply } from '../services/evolutionApi.js';

const stickerCommand = async (message, instance) => {
    try {
        // Verifica se a mensagem é uma imagem ou se tem uma imagem citada
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

        // No Evolution API, podemos baixar a mídia usando o messageId
        const mediaData = await downloadMedia(instance, message.key.id);

        if (mediaData && mediaData.base64) {
            await sendSticker(
                instance,
                message.key.remoteJid,
                mediaData.base64
            );
        } else {
            throw new Error('Não foi possível obter os dados da imagem');
        }

    } catch (error) {
        console.error('Erro ao criar sticker:', error);
        await sendReply(
            instance,
            message.key.remoteJid,
            'Ocorreu um erro ao transformar a imagem em sticker. Verifique se a sua instância da Evolution API está com a opção de download de mídia ativa.',
            message.key.id
        );
    }
};

export default stickerCommand;
