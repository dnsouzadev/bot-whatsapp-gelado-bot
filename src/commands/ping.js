import axios from 'axios';

const pingCommand = async (msg) => {
    const startTime = Date.now();
    const ip = await axios.get('https://api.ipify.org?format=json');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await msg.reply(`Pong! Bot está online! Tempo de resposta: ${responseTime}ms e meu IP é ${ip.data.ip}`);
};

export default pingCommand;
