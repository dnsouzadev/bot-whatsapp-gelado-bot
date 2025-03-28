const sharp = require('sharp');

const stickerCommand = async (msg) => {
    try {
        // Verifica se a mensagem tem uma imagem
        if (!msg.hasMedia) {
            await msg.reply('Por favor, envie uma imagem junto com o comando !sticker');
            return;
        }

        // Obtém a mídia
        const media = await msg.downloadMedia();

        // Verifica se é uma imagem
        if (!media.mimetype.startsWith('image/')) {
            await msg.reply('Por favor, envie apenas imagens para converter em sticker');
            return;
        }

        // Processa a imagem com sharp
        const processedImage = await sharp(Buffer.from(media.data, 'base64'))
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

        // Envia o sticker
        await msg.reply(processedImage, {
            sendMediaAsSticker: true,
            stickerName: 'Sticker Bot',
            stickerAuthor: 'WhatsApp Bot'
        });
    } catch (error) {
        console.error('Erro ao processar sticker:', error);
        await msg.reply('Desculpe, ocorreu um erro ao processar o sticker. Tente novamente.');
    }
};

module.exports = stickerCommand;
