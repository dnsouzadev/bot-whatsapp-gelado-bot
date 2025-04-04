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

        // Função para fazer a requisição com retry
        const makeRequest = async (attempt = 1) => {
            try {
                const response = await axios.get(`https://api.kyroskoh.xyz/valorant/v1/mmr/br/${encodeURIComponent(nick)}/${encodeURIComponent(tag)}?show=combo&display=0`);
                return response.data;
            } catch (error) {
                if (attempt < 5) {
                    console.log(`Tentativa ${attempt} falhou, tentando novamente...`);
                    // Espera 1 segundo antes de tentar novamente
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return makeRequest(attempt + 1);
                }
                throw error;
            }
        };

        // Faz a requisição com retry
        const data = await makeRequest();

        // Formata a mensagem com as informações do rank
        const message = `🎮 ${nick} -> Elo: ${data}`;

        // Envia a mensagem formatada
        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar rank após 5 tentativas:', error);
        await msg.reply('Desculpe, ocorreu um erro ao buscar as informações do rank. Verifique se o nome e tag estão corretos.');
    }
};

module.exports = rankValorantCommand;
