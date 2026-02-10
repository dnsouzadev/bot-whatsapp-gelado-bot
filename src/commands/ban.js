import { sendReply } from '../services/evolutionApi.js';
import { banUser, unbanUser, checkAdmin } from '../services/imageRankService.js';

const banCommand = async (message, instance, args) => {
    try {
        console.log('🔍 BAN - Full message:', JSON.stringify(message, null, 2));
        
        // Check if message is from bot itself (fromMe: true)
        const isFromBot = message.key.fromMe === true;
        const requesterNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const isAdmin = isFromBot || await checkAdmin(requesterNumber);
        
        if (!isAdmin) {
            await sendReply(
                instance, 
                message.key.remoteJid, 
                '🚫 Apenas o administrador do bot pode usar este comando.', 
                message.key.id
            );
            return;
        }
        
        const remoteJid = message.key.remoteJid;
        
        // Check if unbanning
        if (args && args[0] === 'unban') {
            const mentions = message.contextInfo?.mentionedJid || 
                            message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            console.log('📋 BAN UNBAN - Mentions found:', mentions);
            
            if (mentions.length === 0) {
                await sendReply(instance, remoteJid, '❌ Mencione alguém para desbanir!\nExemplo: !ban unban @pessoa', message.key.id);
                return;
            }
            
            const userNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
            const result = await unbanUser(userNumber);
            await sendReply(instance, remoteJid, result, message.key.id);
            return;
        }
        
        // Banning
        if (!args || args.length === 0) {
            await sendReply(
                instance,
                remoteJid,
                '🔨 *SISTEMA DE BAN* 🔨\n\n' +
                'Banir: !ban @pessoa [horas] [motivo]\n' +
                'Exemplo: !ban @João 24 spam\n\n' +
                'Permanente: !ban @pessoa perm [motivo]\n' +
                'Exemplo: !ban @João perm toxicidade\n\n' +
                'Desbanir: !ban unban @pessoa',
                message.key.id
            );
            return;
        }
        
        const mentions = message.contextInfo?.mentionedJid || 
                        message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        console.log('📋 BAN - Mentions found:', mentions);
        console.log('📋 BAN - Args:', args);
        
        if (mentions.length === 0) {
            await sendReply(instance, remoteJid, '❌ Mencione alguém para banir!', message.key.id);
            return;
        }
        
        const userNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
        const durationArg = args[1]?.toLowerCase();
        const reason = args.slice(2).join(' ');
        
        console.log('🔨 Banning:', userNumber, 'Duration:', durationArg, 'Reason:', reason);
        
        let duration;
        if (durationArg === 'perm' || durationArg === 'permanente') {
            duration = 'permanent';
        } else {
            duration = parseInt(durationArg);
            if (isNaN(duration) || duration <= 0) {
                await sendReply(instance, remoteJid, '❌ Duração inválida! Use um número de horas ou "perm"', message.key.id);
                return;
            }
        }
        
        const result = await banUser(userNumber, reason, duration);
        await sendReply(instance, remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in ban command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao processar ban.', message.key.id);
    }
};

export default banCommand;
