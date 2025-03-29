const axios = require('axios');

const rankValorantCommand = async (msg) => {
    try {
        // Pega os argumentos após o comando
        const args = msg.body.split(' ');
        const playerInfo = args.slice(1).join(' '); // Pega tudo após o comando

        if (!playerInfo) {
            await msg.reply('Por favor, forneça o nome do jogador no formato: !rank nome#tag\nExemplo: !rank beg forgiveness#0x0');
            return;
        }

        // Faz o split do nome e tag
        const [nick, tag] = playerInfo.split('#');

        if (!nick || !tag) {
            await msg.reply('Formato inválido. Use: !rank nome#tag\nExemplo: !rank beg forgiveness#0x0');
            return;
        }

        // Faz a requisição para a API
        const response = await axios.get(`https://api.kyroskoh.xyz/valorant/v1/mmr/br/${encodeURIComponent(nick)}/${encodeURIComponent(tag)}?show=combo&display=0`);

        // Extrai os dados relevantes
        const data = response.data;

        // Formata a mensagem com as informações do rank
        const message = `🎮 ${nick} -> Elo: ${data}`;

        // Envia a mensagem formatada
        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar rank:', error);
        await msg.reply('Desculpe, ocorreu um erro ao buscar as informações do rank. Verifique se o nome e tag estão corretos.');
    }
};

module.exports = rankValorantCommand;
