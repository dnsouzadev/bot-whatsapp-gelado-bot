const sharp = require('sharp');
const { MessageMedia } = require('whatsapp-web.js');

const stickerCommand = async (msg) => {
    try {

        // Verifica se a mensagem tem uma imagem
        if (!msg.hasMedia) {
            console.log("Mensagem não contém mídia");
            await msg.reply('Por favor, envie uma imagem junto com o comando !sticker');
            return;
        }

        // Obtém a mídia
        const media = await msg.downloadMedia();

        // Verifica se é uma imagem
        if (!media.mimetype.startsWith('image/')) {
            console.log("Mídia não é uma imagem");
            await msg.reply('Por favor, envie apenas imagens para converter em sticker');
            return;
        }

        // Processa a imagem com sharp
        const processedImage = await sharp(Buffer.from(media.data, 'base64'))
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 100 })
            .toBuffer();

        const stickerMedia = new MessageMedia(
            'image/webp',
            processedImage.toString('base64'),
            'sticker.webp'
        );

        const chat = await msg.getChat();
        await chat.sendMessage(stickerMedia, {
            sendMediaAsSticker: true,
            stickerName: 'Gelado Bot Sticker',
            stickerAuthor: 'dnsouzadev'
        });

    } catch (error) {
        console.error('Erro detalhado ao processar sticker:', error);
        await msg.reply('Desculpe, ocorreu um erro ao processar o sticker. Tente novamente.');
    }
};

module.exports = stickerCommand;
