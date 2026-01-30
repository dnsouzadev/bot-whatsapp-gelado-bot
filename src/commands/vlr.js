import axios from 'axios';
import { sendReply } from '../services/evolutionApi.js';

const vlrCommand = async (message, instance) => {
    try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/results?page=1');
        const data = response.data;

        if (data.status !== 'OK' || !data.data || data.data.length === 0) {
            await sendReply(instance, message.key.remoteJid, 'Nenhum resultado encontrado no momento.', message.key.id);
            return;
        }

        // Limit to top 5 results to avoid message being too long
        const matches = data.data.slice(0, 5);
        
        let replyMessage = '🏆 *Últimos Resultados Valorant (VLR.gg)* 🏆\n\n';

        matches.forEach((match) => {
            const teamA = match.teams[0];
            const teamB = match.teams[1];
            
            // Format score based on winner
            const score = `${teamA.score} x ${teamB.score}`;
            
            // Add flag/country emoji if possible (basic mapping or just text)
            // Using country codes from API for display if needed, but keeping it simple for now
            
            replyMessage += `📅 *${match.tournament}*\n`;
            replyMessage += `🏟️ ${match.event}\n`;
            replyMessage += `⚔️ *${teamA.name}* ${score} *${teamB.name}*\n`;
            replyMessage += `🏁 ${match.status} (${match.ago})\n`;
            replyMessage += `──────────────\n`;
        });

        await sendReply(instance, message.key.remoteJid, replyMessage, message.key.id);

    } catch (error) {
        console.error('Erro VLR:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao consultar a API do VLR.', message.key.id);
    }
};

export default vlrCommand;
