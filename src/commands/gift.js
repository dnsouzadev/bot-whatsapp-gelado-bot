import { sendReply } from '../services/evolutionApi.js';
import { giftToUser } from '../services/imageRankService.js';

const giftCommand = async (message, instance) => {
    try {
        const giverNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                           message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const remoteJid = message.key.remoteJid;
        
        // Get mentioned user
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length === 0) {
            await sendReply(
                instance,
                remoteJid,
                '🎁 *PRESENTEAR* 🎁\n\n' +
                'Doe 1 !random para alguém!\n\n' +
                'Uso: !gift @pessoa\n' +
                'Exemplo: !gift @João\n\n' +
                '⚠️ Só pode enviar 1 presente por dia!',
                message.key.id
            );
            return;
        }
        
        const receiverNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
        
        const result = await giftToUser(giverNumber, receiverNumber);
        
        if (result) {
            await sendReply(instance, remoteJid, result, message.key.id);
        } else {
            await sendReply(
                instance,
                remoteJid,
                `🎁 *PRESENTE ENVIADO!* 🎁\n\n` +
                `✨ Você doou 1 !random\n` +
                `💝 O destinatário recebeu!\n\n` +
                `Que generoso! 🤗`,
                message.key.id
            );
        }
    } catch (error) {
        console.error('Error in gift command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao enviar presente.', message.key.id);
    }
};

export default giftCommand;
