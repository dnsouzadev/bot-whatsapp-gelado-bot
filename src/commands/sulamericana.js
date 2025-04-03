const axios = require('axios');

const sulamericanaCommand = async (msg) => {
    try {
        // Envia mensagem de "carregando..."
        await msg.reply('⚽ Carregando jogos da Sulamericana...');

        // Faz a requisição para a API
        const response = await axios.get('https://api.sportradar.com/soccer/trial/v4/pt/schedules/live/schedules.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf');

        // Filtra apenas os jogos da Sulamericana
        const sulamericanaGames = response.data.schedules.filter(game =>
            game.sport_event.sport_event_context.competition.name === "Taça Sul-Americana"
        );

        if (sulamericanaGames.length === 0) {
            await msg.reply('😔 Não há jogos da Sulamericana acontecendo no momento.');
            return;
        }

        // Formata a mensagem com os jogos
        let message = '🏆 *JOGOS DA SULAMERICANA AO VIVO* 🏆\n\n';

        sulamericanaGames.forEach(game => {
            const homeTeam = game.sport_event.competitors.find(team => team.qualifier === 'home');
            const awayTeam = game.sport_event.competitors.find(team => team.qualifier === 'away');
            const status = game.sport_event_status;
            const venue = game.sport_event.venue;

            // Adiciona bandeira do Brasil ao lado do time brasileiro
            const homeTeamName = homeTeam.country_code === "BRA" ? `${homeTeam.name} 🇧🇷` : homeTeam.name;
            const awayTeamName = awayTeam.country_code === "BRA" ? `${awayTeam.name} 🇧🇷` : awayTeam.name;

            message += `*${homeTeamName} ${status.home_score} x ${status.away_score} ${awayTeamName}*\n`;
            message += `📍 ${venue.name} - ${venue.city_name}, ${venue.country_name}\n`;
            message += `⏰ ${status.clock.played} de jogo\n`;
            message += `📊 ${status.match_status === '1st_half' ? '1º Tempo' : '2º Tempo'}\n`;

            // Adiciona situação do jogo se disponível
            if (status.match_situation) {
                const situation = status.match_situation.status;
                const emoji = situation === 'dangerous' ? '⚠️' :
                             situation === 'attack' ? '⚡' : '🛡️';
                message += `${emoji} ${situation.toUpperCase()}\n`;
            }

            message += '\n';
        });

        // Envia a mensagem formatada
        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar jogos da Sulamericana:', error);
        await msg.reply('Desculpe, ocorreu um erro ao buscar os jogos da Sulamericana. Tente novamente mais tarde.');
    }
};

module.exports = sulamericanaCommand;
