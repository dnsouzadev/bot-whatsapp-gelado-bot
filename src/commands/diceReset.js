import { sendReply } from '../services/evolutionApi.js';
import { playDice } from '../services/imageRankService.js';

const diceResetCommand = async (message, instance, args) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        if (!args || args.length === 0) {
            await sendReply(
                instance, 
                message.key.remoteJid, 
                '🎲 *Jogo do Dado*\n\nEscolha um número de 1 a 6.\nSe acertar, seus limites de !random e reações serão resetados!\n\n⚠️ Só pode usar UMA VEZ!\n\nUso: !dice [número]\nExemplo: !dice 4', 
                message.key.id
            );
            return;
        }
        
        const result = await playDice(userNumber, args[0]);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in dice command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao jogar o dado.', message.key.id);
    }
};

export default diceResetCommand;
