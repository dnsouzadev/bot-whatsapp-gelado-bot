import { sendReply } from '../services/evolutionApi.js';
import { startDuel, acceptDuel } from '../services/imageRankService.js';

const duelCommand = async (message, instance, args) => {
    try {
        const challengerNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                                message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const remoteJid = message.key.remoteJid;
        
        // Check if accepting a duel
        if (args && args[0] === 'aceitar') {
            const result = await acceptDuel(remoteJid, challengerNumber);
            
            if (typeof result === 'string') {
                await sendReply(instance, remoteJid, result, message.key.id);
                return;
            }
            
            // Duel completed
            const msg = `⚔️ *RESULTADO DO DUELO* ⚔️\n\n` +
                       `🪙 Moeda escolhida: ${result.challengerChoiceEmoji} ${result.challengerChoice}\n` +
                       `🎯 Resultado: ${result.resultEmoji} ${result.result}\n\n` +
                       `${result.challengerWon ? '🏆 Desafiante VENCEU!' : '🏆 Desafiado VENCEU!'}\n\n` +
                       `💰 1 reação foi transferida!`;
            
            await sendReply(instance, remoteJid, msg, message.key.id);
            return;
        }
        
        // Starting a new duel
        if (!args || args.length < 2) {
            await sendReply(
                instance,
                remoteJid,
                '⚔️ *DUELO CARA OU COROA* ⚔️\n\n' +
                'Desafie alguém e roube 1 reação!\n\n' +
                'Uso: !duel @pessoa [cara/coroa]\n' +
                'Exemplo: !duel @João cara\n\n' +
                'Para aceitar: !duel aceitar',
                message.key.id
            );
            return;
        }
        
        // Get mentioned user
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length === 0) {
            await sendReply(instance, remoteJid, '❌ Mencione alguém para duelar!\nExemplo: !duel @pessoa cara', message.key.id);
            return;
        }
        
        const challengedNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
        const choice = args[1]?.toLowerCase();
        
        const result = await startDuel(remoteJid, challengerNumber, challengedNumber, choice);
        
        if (result) {
            await sendReply(instance, remoteJid, result, message.key.id);
        } else {
            const choiceEmoji = choice === 'cara' ? '👤' : '👑';
            await sendReply(
                instance,
                remoteJid,
                `⚔️ *DUELO INICIADO!* ⚔️\n\n` +
                `🎯 Escolha: ${choiceEmoji} ${choice}\n` +
                `💰 Prêmio: 1 reação\n\n` +
                `@${challengedNumber}, digite:\n!duel aceitar`,
                message.key.id
            );
        }
    } catch (error) {
        console.error('Error in duel command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao processar duelo.', message.key.id);
    }
};

export default duelCommand;
