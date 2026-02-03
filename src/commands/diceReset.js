import { sendReply } from '../services/evolutionApi.js';
import { playDice } from '../services/imageRankService.js';

const diceResetCommand = async (message, instance, args) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        if (!args || args.length === 0) {
            const now = new Date();
            const hour = now.getHours();
            let period = '';
            if (hour < 12) period = '🌅 Manhã (00:00 - 11:59)';
            else if (hour < 18) period = '☀️ Tarde (12:00 - 17:59)';
            else period = '🌙 Noite (18:00 - 23:59)';
            
            await sendReply(
                instance, 
                message.key.remoteJid, 
                `🎲 *Jogo do Dado*\n\nEscolha um número de 1 a 6.\nSe acertar, seus limites de !random e reações serão resetados!\n\n⏰ Período atual: ${period}\n🎯 3 tentativas por dia (uma por período)\n\nUso: !dice [número]\nExemplo: !dice 4`, 
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
