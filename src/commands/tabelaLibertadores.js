import axios from 'axios';

const tabelaLibertadoresCommand = async (msg) => {
    try {
        // Envia mensagem de "carregando..."
        await msg.reply('📊 Carregando tabela da Libertadores 2025...');

        // Faz a requisição para a API
        const response = await axios.get('https://api.sportradar.com/soccer/trial/v4/pt/seasons/sr:season:127215/standings.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf');

        // Acessa os grupos
        const groups = response.data.standings[0].groups;

        let message = '🏆 *TABELA DA LIBERTADORES 2025* 🏆\n\n';

        // Para cada grupo
        groups.forEach(group => {
            const groupName = group.name;
            const standings = group.standings;

            message += `*${groupName}*\n`;
            message += `*Pos | Time | P | V | E | D | GP | GC | SG | Pts*\n`;
            message += `--------------------------------------------------\n`;

            standings.forEach(team => {
                const {
                    rank, played, win, draw, loss,
                    goals_for, goals_against, goals_diff, points,
                    competitor, current_outcome
                } = team;

                // Adiciona emojis baseado na posição e classificação
                let posEmoji = '';
                if (current_outcome === "Play-off") posEmoji = '🔷'; // Classificados
                else if (current_outcome === "Taça Sul Americana") posEmoji = '🔶'; // Sul-Americana
                else posEmoji = '▫️'; // Eliminados

                // Adiciona emoji para o saldo de gols
                const saldoEmoji = goals_diff > 0 ? '📈' : goals_diff < 0 ? '📉' : '➖';

                // Adiciona emoji da bandeira do país
                let bandeiraEmoji = '';
                switch(competitor.country_code) {
                    case 'BRA': bandeiraEmoji = '🇧🇷'; break;
                    case 'ARG': bandeiraEmoji = '🇦🇷'; break;
                    case 'CHL': bandeiraEmoji = '🇨🇱'; break;
                    case 'ECU': bandeiraEmoji = '🇪🇨'; break;
                    case 'PER': bandeiraEmoji = '🇵🇪'; break;
                    case 'VEN': bandeiraEmoji = '🇻🇪'; break;
                    case 'PRY': bandeiraEmoji = '🇵🇾'; break;
                    case 'URY': bandeiraEmoji = '🇺🇾'; break;
                    case 'BOL': bandeiraEmoji = '🇧🇴'; break;
                    case 'COL': bandeiraEmoji = '🇨🇴'; break;
                }

                // Formata o nome do time com espaçamento correto
                const timeName = competitor.name.padEnd(20).slice(0,20);

                const line = `${posEmoji} *${rank.toString().padStart(2, '')}* | ${bandeiraEmoji} ${timeName} | ${played} | ${win} | ${draw} | ${loss} | ${goals_for} | ${goals_against} | ${saldoEmoji} ${goals_diff >= 0 ? '+' : ''}${goals_diff} | *${points}*`;
                message += `${line}\n`;
            });

            message += '\n';
        });

        // Envia a mensagem
        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar tabela da Libertadores:', error);
        await msg.reply('⚠️ Erro ao buscar a tabela da Libertadores. Tente novamente mais tarde.');
    }
};

export default tabelaLibertadoresCommand;
