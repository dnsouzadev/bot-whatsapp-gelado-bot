import axios from 'axios';
import { sendReply } from '../services/evolutionApi.js';

const rankValorantCommand = async (message, instance) => {
    try {
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '';
        const args = messageContent.split(' ');
        const player = args[1]; // Formato Nome#Tag

        if (!player || !player.includes('#')) {
            await sendReply(instance, message.key.remoteJid, 'Uso correto: !rank Nome#Tag', message.key.id);
            return;
        }

        const [name, tag] = player.split('#');
        const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/mmr/br/${name}/${tag}`);

        const data = response.data.data;
        const rankMsg = `🎮 *Valorant Rank: ${player}*\n\nRank: ${data.currenttierpatched}\nMMR: ${data.ranking_in_tier}\nÚltima variação: ${data.mmr_change_to_last_game}`;

        await sendReply(instance, message.key.remoteJid, rankMsg, message.key.id);
    } catch (error) {
        console.error('Erro Valorant:', error);
        await sendReply(instance, message.key.remoteJid, 'Jogador não encontrado ou API offline.', message.key.id);
    }
};

export default rankValorantCommand;
