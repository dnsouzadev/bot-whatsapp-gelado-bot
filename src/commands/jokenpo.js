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

const jokenpoCommand = async (message, instance, args) => {
    try {
        const challengerNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const remoteJid = message.key.remoteJid;

        if (args && args[0] === 'aceitar') {
            const accepterChoice = args[1]?.toLowerCase();
            const result = await acceptDuel(remoteJid, challengerNumber, accepterChoice);

            if (typeof result === 'string') {
                await sendReply(instance, remoteJid, result, message.key.id);
                return;
            }

            const { duel, result: duelResult } = result;
            const stakeLabel = duel.stakeType === 'random' ? '!random' : 'reação(ões)';

            let msg = `⚔️ *RESULTADO JOKENPÔ* ⚔️\n\n`;
            msg += `✊ Desafiante: ${duel.challengerChoice}\n`;
            msg += `✊ Desafiado: ${accepterChoice}\n`;
            msg += `${duelResult.summary}\n\n`;

            if (duelResult.winner) {
                msg += `🏆 Vencedor: ${duelResult.winner === duel.challenger ? 'Desafiante' : 'Desafiado'}\n\n`;
                msg += `💰 ${duel.stakeAmount} ${stakeLabel} transferido(s)!`;
            } else {
                msg += `🤝 Empate! Nenhuma aposta foi transferida.`;
            }

            await sendReply(instance, remoteJid, msg, message.key.id);
            return;
        }

        if (!args || args.length < 2) {
            await sendReply(
                instance,
                remoteJid,
                '⚔️ *DUELO JOKENPÔ* ⚔️\n\n' +
                'Uso: !jokenpo @pessoa [pedra/papel/tesoura] [reacao/random] [quantidade]\n' +
                'Exemplo: !jokenpo @João pedra reacao 1\n\n' +
                'Para aceitar: !jokenpo aceitar [pedra/papel/tesoura]',
                message.key.id
            );
            return;
        }

        const mentions = message.contextInfo?.mentionedJid ||
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length === 0) {
            await sendReply(instance, remoteJid, '❌ Mencione alguém para duelar!', message.key.id);
            return;
        }

        const challengedNumber = mentions[0].replace('@lid', '').replace('@s.whatsapp.net', '');
        const choice = args[1]?.toLowerCase();
        const { stakeType, stakeAmount } = parseStakeArgs(args, 2);

        const result = await startDuel(remoteJid, challengerNumber, challengedNumber, choice, stakeType, stakeAmount, 'jokenpo');
        if (result) {
            await sendReply(instance, remoteJid, result, message.key.id);
            return;
        }

        const stakeLabel = stakeType === 'random' ? '!random' : 'reação(ões)';
        const amountLabel = parseInt(stakeAmount, 10) || 1;
        await sendReply(
            instance,
            remoteJid,
            `⚔️ *DUELO INICIADO!* ⚔️\n\n` +
            `✊ Escolha do desafiante: ${choice}\n` +
            `💰 Prêmio: ${amountLabel} ${stakeLabel}\n\n` +
            `@${challengedNumber}, digite:\n!jokenpo aceitar [pedra/papel/tesoura]`,
            message.key.id
        );
    } catch (error) {
        console.error('Error in jokenpo command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao processar duelo de jokenpô.', message.key.id);
    }
};

export default jokenpoCommand;
