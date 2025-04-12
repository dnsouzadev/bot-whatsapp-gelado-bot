import axios from 'axios';

// Constantes
const MATCH_EVENT = "Champions Tour 2025: Americas Stage 1";
const FLAGS = {
    'flag_br': '🇧🇷',
    'flag_us': '🇺🇸',
    'flag_ar': '🇦🇷',
    'flag_ca': '🇨🇦',
    'flag_mx': '🇲🇽',
    'flag_cl': '🇨🇱',
    'flag_co': '🇨🇴',
    'flag_pe': '🇵🇪'
};

// Funções auxiliares
const getFlag = (flagCode) => FLAGS[flagCode] || '🏳️';

const filterAmericasMatches = (matches, field) =>
    matches.filter(match => match[field] === MATCH_EVENT);

const formatMatchInfo = (match, type) => {
    const flag1 = getFlag(match.flag1);
    const flag2 = getFlag(match.flag2);

    let message = '';

    switch(type) {
        case 'live':
            message = `*${match.team1}* ${flag1} ${match.score1} - ${match.score2} ${flag2} *${match.team2}*\n`;
            message += `🗺️ Mapa: ${match.current_map}\n`;
            message += `📊 ${match.match_series}\n`;
            message += `🔗 ${match.match_page}\n`;
            break;

        case 'upcoming':
            message = `*${match.team1}* ${flag1} vs ${flag2} *${match.team2}*\n`;
            message += `⏰ ${match.time_until_match}\n`;
            message += `📅 ${match.match_date}\n`;
            message += `🎯 ${match.match_series}\n`;
            break;

        case 'results':
            message = `*${match.team1}* ${flag1} ${match.score1} - ${match.score2} ${flag2} *${match.team2}*\n`;
            message += `⏰ ${match.time_completed}\n`;
            message += `📊 ${match.round_info}\n`;
            break;
    }

    return message;
};

const vctamericasCommand = async (msg) => {
    try {
        // Busca dados das APIs
        const [upcomingResponse, resultsResponse, liveResponse] = await Promise.all([
            axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=upcoming&page=0'),
            axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=results&page=0'),
            axios.get('https://vlrggapi-pmij-ot88qvarw-rehkloos-projects.vercel.app/match?q=live_score&page=0')
        ]);

        // Filtra jogos do VCT Americas
        const americasUpcoming = filterAmericasMatches(upcomingResponse.data.data.segments, 'match_event');
        const americasResults = filterAmericasMatches(resultsResponse.data.data.segments, 'tournament_name');
        const americasLive = filterAmericasMatches(liveResponse.data.data.segments, 'match_event');

        let message = '🎮 *VCT AMERICAS - INFORMAÇÕES* 🎮\n\n';

        // Adiciona jogos ao vivo
        if (americasLive.length > 0) {
            message += '*🔥 JOGOS AO VIVO*\n\n';
            americasLive.forEach(match => {
                message += formatMatchInfo(match, 'live') + '\n';
            });
        }

        // Adiciona próximos jogos
        if (americasUpcoming.length > 0) {
            message += '*📅 PRÓXIMOS JOGOS*\n\n';
            americasUpcoming.forEach(match => {
                message += formatMatchInfo(match, 'upcoming') + '\n';
            });
        } else {
            message += '*📅 PRÓXIMOS JOGOS*\n';
            message += '❌ Não há jogos agendados no momento.\n\n';
        }

        // Adiciona últimos resultados
        if (americasResults.length > 0) {
            message += '*🏆 ÚLTIMOS RESULTADOS*\n\n';
            americasResults.forEach(match => {
                message += formatMatchInfo(match, 'results') + '\n';
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

export default vctamericasCommand;
