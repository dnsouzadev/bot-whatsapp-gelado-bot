const axios = require('axios');

const brasileiraoCommand = async (msg) => {
    try {
        // Envia mensagem de "carregando..."
        await msg.reply('⚽ Carregando jogos do Brasileirão...');

        // Faz a requisição para a API
        const response = await axios.get('https://api.sportradar.com/soccer/trial/v4/pt/schedules/live/schedules.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf');

        // Filtra apenas os jogos do Brasileirão
        const brasileiraoGames = response.data.schedules.filter(game =>
            game.sport_event.sport_event_context.competition.name === "Campeonato Brasileiro Série A"
        );

        if (brasileiraoGames.length === 0) {
            await msg.reply('😔 Não há jogos do Brasileirão acontecendo no momento.');
            return;
        }

        // Formata a mensagem com os jogos
        let message = '🏆 *JOGOS DO BRASILEIRÃO AO VIVO* 🏆\n\n';

        brasileiraoGames.forEach(game => {
            const homeTeam = game.sport_event.competitors.find(team => team.qualifier === 'home');
            const awayTeam = game.sport_event.competitors.find(team => team.qualifier === 'away');
            const status = game.sport_event_status;
            const venue = game.sport_event.venue;

            message += `*${homeTeam.name} ${status.home_score} x ${status.away_score} ${awayTeam.name}*\n`;
            message += `📍 ${venue.name} - ${venue.city_name}\n`;
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
        console.error('Erro ao buscar jogos do Brasileirão:', error);
        await msg.reply('Desculpe, ocorreu um erro ao buscar os jogos do Brasileirão. Tente novamente mais tarde.');
    }
};

module.exports = brasileiraoCommand;
