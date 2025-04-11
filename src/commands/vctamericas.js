const axios = require('axios');

const vctamericasCommand = async (msg) => {
    try {
        // Busca próximos jogos
        const upcomingResponse = await axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=upcoming&page=0');
        const upcomingMatches = upcomingResponse.data.data.segments;

        // Busca últimos resultados
        const resultsResponse = await axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=results&page=0');
        const resultsMatches = resultsResponse.data.data.segments;

        // Busca jogos ao vivo
        const liveResponse = await axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=live_score&page=0');
        const liveMatches = liveResponse.data.data.segments;

        // Filtra apenas os jogos do VCT Americas
        const americasUpcoming = upcomingMatches.filter(match =>
            match.match_event === "Champions Tour 2025: Americas Stage 1"
        );

        const americasResults = resultsMatches.filter(match =>
            match.tournament_name === "Champions Tour 2025: Americas Stage 1"
        );

        const americasLive = liveMatches.filter(match =>
            match.match_event === "Champions Tour 2025: Americas Stage 1"
        );

        let message = '🎮 *VCT AMERICAS - INFORMAÇÕES* 🎮\n\n';

        // Adiciona jogos ao vivo
        if (americasLive.length > 0) {
            message += '*🔥 JOGOS AO VIVO*\n\n';
            americasLive.forEach(match => {
                const flags = {
                    'flag_br': '🇧🇷',
                    'flag_us': '🇺🇸',
                    'flag_ar': '🇦🇷',
                    'flag_ca': '🇨🇦',
                    'flag_mx': '🇲🇽',
                    'flag_cl': '🇨🇱',
                    'flag_co': '🇨🇴',
                    'flag_pe': '🇵🇪'
                };

                const flag1 = flags[match.flag1] || '🏳️';
                const flag2 = flags[match.flag2] || '🏳️';

                message += `*${match.team1}* ${flag1} ${match.score1} - ${match.score2} ${flag2} *${match.team2}*\n`;
                message += `🗺️ Mapa: ${match.current_map}\n`;
                message += `📊 ${match.match_series}\n`;
                message += `🔗 ${match.match_page}\n\n`;
            });
        }

        // Adiciona próximos jogos
        if (americasUpcoming.length > 0) {
            message += '*📅 PRÓXIMOS JOGOS*\n\n';
            americasUpcoming.forEach(match => {
                const flags = {
                    'flag_br': '🇧🇷',
                    'flag_us': '🇺🇸',
                    'flag_ar': '🇦🇷',
                    'flag_ca': '🇨🇦',
                    'flag_mx': '🇲🇽',
                    'flag_cl': '🇨🇱',
                    'flag_co': '🇨🇴',
                    'flag_pe': '🇵🇪'
                };

                const flag1 = flags[match.flag1] || '🏳️';
                const flag2 = flags[match.flag2] || '🏳️';

                message += `*${match.team1}* ${flag1} vs ${flag2} *${match.team2}*\n`;
                message += `⏰ ${match.time_until_match}\n`;
                message += `📅 ${match.match_date}\n`;
                message += `🎯 ${match.match_series}\n\n`;
            });
        } else {
            message += '*📅 PRÓXIMOS JOGOS*\n';
            message += '❌ Não há jogos agendados no momento.\n\n';
        }

        // Adiciona últimos resultados
        if (americasResults.length > 0) {
            message += '*🏆 ÚLTIMOS RESULTADOS*\n\n';
            americasResults.forEach(match => {
                const flags = {
                    'flag_br': '🇧🇷',
                    'flag_us': '🇺🇸',
                    'flag_ar': '🇦🇷',
                    'flag_ca': '🇨🇦',
                    'flag_mx': '🇲🇽',
                    'flag_cl': '🇨🇱',
                    'flag_co': '🇨🇴',
                    'flag_pe': '🇵🇪'
                };

                const flag1 = flags[match.flag1] || '🏳️';
                const flag2 = flags[match.flag2] || '🏳️';

                message += `*${match.team1}* ${flag1} ${match.score1} - ${match.score2} ${flag2} *${match.team2}*\n`;
                message += `⏰ ${match.time_completed}\n`;
                message += `📊 ${match.round_info}\n\n`;
            });
        } else {
            message += '*🏆 ÚLTIMOS RESULTADOS*\n';
            message += '❌ Não há resultados recentes.\n\n';
        }

        await msg.reply(message);
    } catch (error) {
        console.error('Erro ao buscar informações do VCT Americas:', error);
        await msg.reply('❌ Erro ao buscar informações do VCT Americas. Tente novamente mais tarde.');
    }
};

module.exports = vctamericasCommand;
