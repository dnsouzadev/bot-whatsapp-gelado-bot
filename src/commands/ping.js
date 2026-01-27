import axios from 'axios';
import { sendReply } from '../services/evolutionApi.js';

const pingCommand = async (message, instance) => {
    const startTime = Date.now();
    const ip = await axios.get('https://api.ipify.org?format=json');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await sendReply(
        instance,
        message.key.remoteJid,
        `Pong! Bot está online! Tempo de resposta: ${responseTime}ms e meu IP é ${ip.data.ip}`,
        message.key.id
    );
};

export default pingCommand;
