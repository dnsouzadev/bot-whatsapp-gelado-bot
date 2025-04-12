import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

const stickerCommand = async (msg) => {
    try {
        // Verifica se a mensagem tem uma mídia
        if (!msg.hasMedia) {
            console.log("Mensagem não contém mídia");
            await msg.reply('Por favor, envie uma imagem, GIF ou vídeo junto com o comando !sticker');
            return;
        }

        // Obtém a mídia
        const media = await msg.downloadMedia();
        console.log("Tipo de mídia recebida:", media.mimetype);

        // Verifica se é uma imagem, GIF ou vídeo
        if (!media.mimetype.startsWith('image/') && !media.mimetype.startsWith('video/')) {
            console.log("Mídia não é uma imagem, GIF ou vídeo");
            await msg.reply('Por favor, envie apenas imagens, GIFs ou vídeos para converter em sticker');
            return;
        }

        // Verifica se é um GIF ou vídeo
        const isGif = media.mimetype === 'image/gif' || media.mimetype === 'image/webp';
        const isVideo = media.mimetype.startsWith('video/');
        console.log("É GIF?", isGif);
        console.log("É Vídeo?", isVideo);

        let processedMedia;
        if (isVideo) {
            // Cria um diretório temporário
            const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sticker-'));
            const inputPath = path.join(tempDir, 'input.mp4');
            const outputPath = path.join(tempDir, 'output.webp');

            // Salva o vídeo temporariamente
            await fs.promises.writeFile(inputPath, Buffer.from(media.data, 'base64'));

            // Converte o vídeo para WebP animado
            await new Promise((resolve, reject) => {
                const ffmpegProcess = spawn(ffmpeg, [
                    '-i', inputPath,
                    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
                    '-c:v', 'libwebp',
                    '-loop', '0',
                    '-preset', 'picture',
                    '-an',
                    '-vsync', '0',
                    outputPath
                ]);

                ffmpegProcess.stderr.on('data', (data) => {
                    console.log(`FFmpeg: ${data}`);
                });

                ffmpegProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`FFmpeg process exited with code ${code}`));
                    }
                });
            });

            // Lê o arquivo WebP processado
            processedMedia = await fs.promises.readFile(outputPath);

            // Limpa os arquivos temporários
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } else if (isGif) {
            try {
                // Para GIFs, tenta processar com sharp mantendo a animação
                processedMedia = await sharp(Buffer.from(media.data, 'base64'))
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .toBuffer();
                console.log("GIF processado com sucesso");
            } catch (gifError) {
                console.error("Erro ao processar GIF:", gifError);
                // Se falhar, tenta usar o GIF original
                processedMedia = Buffer.from(media.data, 'base64');
            }
        } else {
            // Para imagens estáticas, processa com sharp
            processedMedia = await sharp(Buffer.from(media.data, 'base64'))
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 100 })
                .toBuffer();
        }

        console.log("Tamanho do media processado:", processedMedia.length);

        const stickerMedia = new MessageMedia(
            'image/webp',
            processedMedia.toString('base64'),
            'sticker.webp'
        );

        const chat = await msg.getChat();
        await chat.sendMessage(stickerMedia, {
            sendMediaAsSticker: true,
            stickerName: 'Gelado Bot Sticker',
            stickerAuthor: 'dnsouzadev'
        })

    } catch (error) {
        console.error('Erro detalhado ao processar sticker:', error);
        console.error('Stack trace:', error.stack);
        await msg.reply('Desculpe, ocorreu um erro ao processar o sticker. Tente novamente.');
    }
};

export default stickerCommand;
