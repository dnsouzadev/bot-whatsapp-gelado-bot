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
        //https://vaccie.pythonanywhere.com/mmr/vaccie/666/eu
        const response = await axios.get(`https://vaccie.pythonanywhere.com/mmr/${name}/${tag}/br`);

        const data = response;
        const rankMsg = `🎮 *Valorant Rank: ${data}`
        await sendReply(instance, message.key.remoteJid, rankMsg, message.key.id);
    } catch (error) {
        console.error('Erro Valorant:', error);
        await sendReply(instance, message.key.remoteJid, 'Jogador não encontrado ou API offline.', message.key.id);
    }
};

export default rankValorantCommand;
