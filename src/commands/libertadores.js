import axios from 'axios';

// Função auxiliar para bandeira com base no country_code
const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '';
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
};

const libertadoresCommand = async (msg) => {
    try {
        await msg.reply('⚽ Carregando jogos da Libertadores...');

        const response = await axios.get('https://api.sportradar.com/soccer/trial/v4/pt/schedules/live/schedules.json?api_key=uaJa6KjCWdvRDzmWHhz0yRBdwwsZdxT6sKHmR4zf');

        const libertadoresGames = response.data.schedules.filter(game =>
            game.sport_event?.sport_event_context?.competition?.name === "Copa Libertadores"
        );

        if (libertadoresGames.length === 0) {
            await msg.reply('😔 Não há jogos da Libertadores no momento.');
            return;
        }

        let liveGames = '🔴 *AO VIVO AGORA* 🔴\n\n';
        let upcomingGames = '⏳ *A COMEÇAR EM BREVE* ⏳\n\n';

        libertadoresGames.forEach(game => {
            const event = game.sport_event;
            const status = game.sport_event_status;
            const venue = event.venue;

            const homeTeam = event.competitors.find(team => team.qualifier === 'home');
            const awayTeam = event.competitors.find(team => team.qualifier === 'away');

            const isLive = status?.status === 'live';
            const hasStarted = status?.status !== 'not_started';
            const flag = getFlagEmoji(venue.country_code);
            const clock = status?.clock?.played ?? '⏳ Aguardando';
            const tempo = status?.match_status === '1st_half' ? '⏱️ 1º Tempo' :
                          status?.match_status === '2nd_half' ? '⏱️ 2º Tempo' :
                          !hasStarted ? '🔜 Vai começar' : '🏁 Encerrado';

            const scoreLine = hasStarted
                ? `*${homeTeam.name}* ${status.home_score} x ${status.away_score} *${awayTeam.name}*`
                : `*${homeTeam.name}* 🆚 *${awayTeam.name}*`;

            const gameInfo =
`${scoreLine}
📍 ${venue.name} (${venue.city_name}, ${venue.country_name}) ${flag}
🕒 ${new Date(event.start_time).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Horário de Brasília)
${hasStarted ? `⏰ ${clock}\n📊 ${tempo}` : '🎬 Aguardando início'}

${status?.match_situation ? `${status.match_situation.status === 'attack' ? '⚡ ATAQUE' : status.match_situation.status === 'dangerous' ? '⚠️ PERIGO' : '🛡️ DEFESA'}\n` : ''}`;

            if (isLive) {
                liveGames += gameInfo + '\n━━━━━━━━━━━━━━\n\n';
            } else {
                upcomingGames += gameInfo + '\n━━━━━━━━━━━━━━\n\n';
            }
        });

        const finalMessage = `🏆 *COPA LIBERTADORES - JOGOS DE HOJE* 🏆\n\n` +
                             (liveGames.includes('*') ? liveGames : '🔴 Nenhum jogo ao vivo no momento.\n\n') +
                             (upcomingGames.includes('*') ? upcomingGames : '');

        await msg.reply(finalMessage.trim());
    } catch (error) {
        console.error('Erro ao buscar jogos da Libertadores:', error);
        await msg.reply('❌ Ocorreu um erro ao buscar os jogos da Libertadores. Tente novamente mais tarde.');
    }
};

export default libertadoresCommand;
