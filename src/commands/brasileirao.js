import axios from 'axios';
import { sendReply } from '../services/evolutionApi.js';

const brasileiraoCommand = async (message, instance) => {
    try {
        // Exemplo de integração com API de futebol (ajuste a URL conforme sua fonte de dados)
        const response = await axios.get('https://api.api-futebol.com.br/v1/campeonatos/10/rodada-atual', {
            headers: { 'Authorization': `Bearer ${process.env.API_FUTEBOL_KEY}` }
        });

        const rodada = response.data;
        let texto = `⚽ *Brasileirão - Rodada ${rodada.rodada}*\n\n`;

        rodada.partidas.forEach(jogo => {
            texto += `${jogo.placar_mandante} ${jogo.time_mandante.sigla} x ${jogo.time_visitante.sigla} ${jogo.placar_visitante}\n`;
            texto += `Status: ${jogo.status}\n\n`;
        });

        await sendReply(instance, message.key.remoteJid, texto, message.key.id);
    } catch (error) {
        console.error('Erro Brasileirão:', error);
        await sendReply(instance, message.key.remoteJid, 'Não consegui buscar os jogos do Brasileirão agora.', message.key.id);
    }
};

export default brasileiraoCommand;
