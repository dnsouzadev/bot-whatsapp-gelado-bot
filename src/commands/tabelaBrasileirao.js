const axios = require('axios');

const tabelaBrasileiraoCommand = async (msg) => {
    try {
        await msg.reply('📊 Carregando tabela do Brasileirão Série A...');

        // Substitua com o season_id atual da Série A
        const seasonId = 'sr:season:96129'; // <- atualize esse ID
        const url = `https://api.sportradar.com/soccer/trial/v4/pt/seasons/${seasonId}/standings.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf`;

        const response = await axios.get(url);

        const standings = response.data.standings[0].groups[0].teams;

        let tabela = '🏆 *TABELA DO BRASILEIRÃO SÉRIE A* 🏆\n\n';

        standings.forEach((team, index) => {
            const pos = index + 1;
            const name = team.team.name;
            const pts = team.points;
            const pj = team.played;
            const v = team.won;
            const e = team.drawn;
            const d = team.lost;
            const saldo = team.goals_for - team.goals_against;

            let posEmoji = '▫️'; // padrão
            if (pos === 1) posEmoji = '🥇';
            else if (pos === 2) posEmoji = '🥈';
            else if (pos === 3) posEmoji = '🥉';
            else if (pos <= 6) posEmoji = '🔷'; // Libertadores
            else if (pos <= 12) posEmoji = '🔶'; // Sul-Americana
            else if (pos >= 17) posEmoji = '🔻'; // Z4

            tabela += `${posEmoji} *${pos}. ${name}* - ${pts} pts\n`;
            tabela += `   Jogos: ${pj} | V: ${v} E: ${e} D: ${d} | SG: ${saldo}\n\n`;
        });

        await msg.reply(tabela.trim());
    } catch (error) {
        console.error('Erro ao buscar a tabela do Brasileirão:', error);
        await msg.reply('❌ Ocorreu um erro ao buscar a tabela do Brasileirão. Tente novamente mais tarde.');
    }
};

module.exports = tabelaBrasileiraoCommand;
