import axios from 'axios';
import { sendReply } from '../services/evolutionApi.js';

const rankValorantCommand = async (message, instance) => {
    try {
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '';
        
        // Remove o comando (!rank) e pega o resto da string
        const args = messageContent.trim().split(/\s+/);
        const player = args.slice(1).join(' '); // Junta tudo após o comando com espaços

        if (!player || !player.includes('#')) {
            await sendReply(instance, message.key.remoteJid, 'Uso correto: !rank Nome#Tag', message.key.id);
            return;
        }

        const [name, tag] = player.split('#');
        //https://vaccie.pythonanywhere.com/mmr/vaccie/666/eu
        const response = await axios.get(`https://vaccie.pythonanywhere.com/mmr/${name}/${tag}/br`);

        const data = response.data;
        const rankMsg = `🎮 *Valorant Rank: ${data}`
        await sendReply(instance, message.key.remoteJid, rankMsg, message.key.id);
    } catch (error) {
        console.error('Erro Valorant:', error);
        await sendReply(instance, message.key.remoteJid, 'Jogador não encontrado ou API offline.', message.key.id);
    }
};

export default rankValorantCommand;
