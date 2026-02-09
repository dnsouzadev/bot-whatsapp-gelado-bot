import { sendReply } from '../services/evolutionApi.js';
import { startDuel, acceptDuel } from '../services/imageRankService.js';

const parseStakeArgs = (args, index) => {
    let stakeType = args[index];
    let stakeAmount = args[index + 1];

    if (stakeType && !isNaN(parseInt(stakeType, 10))) {
        stakeAmount = stakeType;
        stakeType = null;
    }

    return { stakeType, stakeAmount };
};

const duelCommand = async (message, instance, args) => {
    try {
        console.log('🔍 DUEL - Full message:', JSON.stringify(message, null, 2));
        
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
            const { duel, result: duelResult } = result;
            const stakeLabel = duel.stakeType === 'random' ? '!random' : 'reação(ões)';
            let msg = `⚔️ *RESULTADO DO DUELO* ⚔️\n\n`;
            msg += `🪙 Moeda do desafiante: ${duel.challengerChoice}\n`;
            msg += `${duelResult.summary}\n\n`;

            if (duelResult.winner) {
                msg += `${duelResult.winner === duel.challenger ? '🏆 Desafiante VENCEU!' : '🏆 Desafiado VENCEU!'}\n\n`;
                msg += `💰 ${duel.stakeAmount} ${stakeLabel} transferido(s)!`;
            } else {
                msg += `🤝 Empate! Nenhuma aposta foi transferida.`;
            }
            
            await sendReply(instance, remoteJid, msg, message.key.id);
            return;
        }
        
        // Starting a new duel
        if (!args || args.length < 2) {
            await sendReply(
                instance,
                remoteJid,
                '⚔️ *DUELO CARA OU COROA* ⚔️\n\n' +
                'Desafie alguém e aposte reações ou !random!\n\n' +
                'Uso: !duel @pessoa [cara/coroa] [reacao/random] [quantidade]\n' +
                'Exemplo: !duel @João cara reacao 2\n\n' +
                'Para aceitar: !duel aceitar',
                message.key.id
            );
            return;
        }
        
        // Get mentioned user
        const mentions = message.contextInfo?.mentionedJid || 
                        message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        console.log('📋 Mentions found:', mentions);
        console.log('📋 Args:', args);
        
        if (mentions.length === 0) {
            await sendReply(instance, remoteJid, '❌ Mencione alguém para duelar!\nExemplo: !duel @pessoa cara', message.key.id);
            return;
        }
        
        const challengedNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
        const choice = args[1]?.toLowerCase();
        const { stakeType, stakeAmount } = parseStakeArgs(args, 2);
        
        console.log('👤 Challenger:', challengerNumber);
        console.log('🎯 Challenged:', challengedNumber);
        console.log('🪙 Choice:', choice);
        
        const result = await startDuel(remoteJid, challengerNumber, challengedNumber, choice, stakeType, stakeAmount, 'coin');
        
        if (result) {
            await sendReply(instance, remoteJid, result, message.key.id);
        } else {
            const choiceEmoji = choice === 'cara' ? '👤' : '👑';
            const stakeLabel = stakeType === 'random' ? '!random' : 'reação(ões)';
            const amountLabel = parseInt(stakeAmount, 10) || 1;
            await sendReply(
                instance,
                remoteJid,
                `⚔️ *DUELO INICIADO!* ⚔️\n\n` +
                `🎯 Escolha: ${choiceEmoji} ${choice}\n` +
                `💰 Prêmio: ${amountLabel} ${stakeLabel}\n\n` +
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
