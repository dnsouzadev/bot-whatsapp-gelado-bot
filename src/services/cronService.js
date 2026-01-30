import { sendReply, sendMessage, sendSticker, downloadMedia } from './evolutionApi.js';

// Stores users currently setting up a cron: { 'remoteJid': { minutes: 5 } }
const activeCronSetups = {};

/**
 * Initiates the cron setup process for a user/group.
 */
export const startCronSetup = (remoteJid, minutes) => {
    activeCronSetups[remoteJid] = { minutes };
};

/**
 * Checks if the user is setting up a cron job and processes the content.
 */
export const handleCronStep = async (instance, remoteJid, message, messageId) => {
    const setupData = activeCronSetups[remoteJid];
    
    if (!setupData) return false; // Not in setup mode

    try {
        const isSticker = message.message?.stickerMessage;
        let contentData;

        if (isSticker) {
            try {
                const mediaData = await downloadMedia(instance, message);
                if (!mediaData || !mediaData.base64) {
                    throw new Error('Falha ao baixar sticker');
                }
                contentData = {
                    type: 'sticker',
                    content: mediaData.base64 
                };
            } catch (err) {
                console.error('Error downloading sticker for cron:', err);
                await sendReply(instance, remoteJid, '❌ Erro ao processar o sticker. Tente novamente.', messageId);
                return true; 
            }
        } else {
            const textContent = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || '';
            
            if (!textContent) {
                await sendReply(instance, remoteJid, '❌ Conteúdo inválido. Envie texto ou um sticker.', messageId);
                return true;
            }

            contentData = {
                type: 'text',
                content: textContent
            };
        }

        const { minutes } = setupData;
        const msDelay = minutes * 60 * 1000;

        await sendReply(
            instance,
            remoteJid,
            `⏰ Agendado! Sua mensagem será enviada em ${minutes} minuto(s).`,
            messageId
        );

        // Schedule the message
        setTimeout(async () => {
            try {
                if (contentData.type === 'sticker') {
                    await sendSticker(instance, remoteJid, contentData.content);
                } else {
                    await sendMessage(instance, remoteJid, contentData.content); 
                }
            } catch (error) {
                console.error('Error executing cron job:', error);
            }
        }, msDelay);

        // Clear state
        delete activeCronSetups[remoteJid];

        return true; // Handled successfully
    } catch (error) {
        console.error('Error handling cron step:', error);
        // Clean up on critical error so user isn't stuck
        delete activeCronSetups[remoteJid]; 
        return false;
    }
};
