const axios = require('axios');

const tabelaBrasileiraoCommand = async (msg) => {
    try {
        // Envia mensagem de "carregando..."
        await msg.reply('📊 Carregando tabela do Brasileirão 2025...');

        const season_id = 'sr:season:128461'
        // Faz a requisição para a API
        const response = await axios.get(`https://api.sportradar.com/soccer/trial/v4/pt/seasons/${season_id}/standings.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf`);

        // Acessa a tabela
        const standings = response.data.standings.find(s => s.type === "total");
        const teams = standings.groups[0].standings;

        let message = '🏆 *TABELA DO BRASILEIRÃO 2025* 🏆\n\n';
        message += `*Pos | Time | P | V | E | D | GP | GC | SG | Pts*\n`;
        message += `--------------------------------------------------\n`;

        teams.forEach(team => {
            const {
                rank, played, win, draw, loss,
                goals_for, goals_against, goals_diff, points,
                competitor
            } = team;

            // Adiciona emojis baseado na posição
            let posEmoji = '';
            if (rank === 1) posEmoji = '🥇';
            else if (rank === 2) posEmoji = '🥈';
            else if (rank === 3) posEmoji = '🥉';
            else if (rank <= 6) posEmoji = '🔷'; // Libertadores
            else if (rank <= 12) posEmoji = '🔶'; // Sul-Americana
            else if (rank >= 17) posEmoji = '🔻'; // Z4
            else posEmoji = '▫️';

            // Adiciona emoji para o saldo de gols
            const saldoEmoji = goals_diff > 0 ? '📈' : goals_diff < 0 ? '📉' : '➖';

            // Formata o nome do time com emoji do Brasil se for time brasileiro
            const timeEmoji = competitor.country === 'BRA' ? '🇧🇷' : '';

            const line = `${posEmoji} *${rank.toString().padStart(2, '')}* | ${timeEmoji} ${competitor.name.padEnd(16).slice(0,16)} | ${played} | ${win} | ${draw} | ${loss} | ${goals_for} | ${goals_against} | ${saldoEmoji} ${goals_diff >= 0 ? '+' : ''}${goals_diff} | *${points}*`;
            message += `${line}\n`;
        });

        // Adiciona legenda
        message += '\n*Legenda:*\n';
        message += '🥇 Primeiro lugar\n';
        message += '🥈 Segundo lugar\n';
        message += '🥉 Terceiro lugar\n';
        message += '🔷 Zona da Libertadores\n';
        message += '🔶 Zona da Sul-Americana\n';
        message += '🔻 Zona de rebaixamento\n';
        message += '📈 Saldo positivo\n';
        message += '📉 Saldo negativo\n';
        message += '➖ Saldo neutro\n';
        message += '🇧🇷 Time brasileiro\n';

        // Envia a mensagem
        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar tabela do Brasileirão:', error);
        await msg.reply('⚠️ Erro ao buscar a tabela do Brasileirão. Tente novamente mais tarde.');
    }
};

module.exports = tabelaBrasileiraoCommand;
