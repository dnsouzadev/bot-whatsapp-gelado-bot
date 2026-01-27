import { sendReply } from '../services/evolutionApi.js';

const helpCommand = async (message, instance) => {
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

🎲 *Jogos*
• !dado - Rola um dado (1-6)
• !caraoucoroa - Cara ou coroa
• !ppt [pedra/papel/tesoura] - Pedra, papel ou tesoura

😄 *Diversão*
• !gato - Foto aleatória de gato
• !chat [mensagem] - Conversa com IA

📱 *Outros*
• !sticker - Converte imagem em sticker
• !everyone - Marca todos do grupo
• !ping - Verifica se o bot está online
• !ajuda - Mostra esta mensagem

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
