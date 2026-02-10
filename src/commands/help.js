import { sendReply } from '../services/evolutionApi.js';
import { listCustomCommands } from '../services/customCommandService.js';

const helpCommand = async (message, instance) => {
    const customCommands = await listCustomCommands();
    const customCommandsList = customCommands.length > 0 
        ? customCommands.map(cmd => `• !${cmd}`).join('\n')
        : '• Nenhum comando personalizado criado';

    const helpMessage = `
🤖 *Bot de WhatsApp - Comandos Disponíveis*

⚽ *Futebol*
• !libertadores - Jogos ao vivo da Libertadores
• !sulamericana - Jogos ao vivo da Sul-Americana
• !brasileirao - Jogos ao vivo do Brasileirão
• !tabelabrasileirao - Tabela do Brasileirão
• !tabelalibertadores - Tabela da Libertadores
• !vctamericas - Informações do VCT Americas

🎮 *Valorant*
• !rank [nome#tag] - Rank de um jogador
• !vlr - Últimos resultados mundiais

📷 *Ranking de Imagens*
• !register - Registra uma foto no ranking (use legenda para dar nome)
• !random - Mostra uma foto aleatória para votar
• !carta [posição] - Mostra a carta da imagem (visualização sem votos)
• !imgrank - Mostra o top 10 das fotos

🎁 *Giveaways*
• !dice - Jogo do dado com reset de limites
• !roleta - Roleta da sorte por período
• !caixa - Caixa misteriosa diária
• !raspadinha - Raspadinha diária
• !tesouro - Baú do tesouro diário
• !slot - Slot da sorte diário
• !meteoro - Chuva de meteoros diária

🎲 *Jogos*
• !dado - Rola um dado (1-6)
• !caraoucoroa - Cara ou coroa
• !duel - Duelo cara ou coroa com aposta
• !parimpar - Duelo par ou ímpar com aposta
• !dueldado - Duelo do dado com aposta
• !jokenpo - Duelo jokenpô com aposta
• !ppt [pedra/papel/tesoura] - Pedra, papel ou tesoura

😄 *Diversão*
• !gato - Foto aleatória de gato
• !chat [mensagem] - Conversa com IA
• !smurfdomuca - Arte smurfdomuca

⏰ *Agendamento*
• !cron [minutos] - Agenda uma mensagem ou sticker

📱 *Outros*
• !sticker - Converte imagem em sticker
• !make [nome] - Cria comando personalizado
• !adm [1-100] - Desafio para virar admin por 24h (1 tentativa por período)
• !everyone - Marca todos do grupo
• !ping - Verifica se o bot está online
• !ajuda - Mostra esta mensagem

🛠️ *Personalizados*
${customCommandsList}

_Bot funciona apenas em grupos!_
    `.trim();

    await sendReply(
        instance,
        message.key.remoteJid,
        helpMessage,
        message.key.id
    );
};

export default helpCommand;
