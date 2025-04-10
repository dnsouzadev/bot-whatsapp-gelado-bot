const helpCommand = async (msg) => {
    const helpMessage = `
*🤖 Lista de Comandos Disponíveis:*

*⚽ Futebol*
!libertadores - Mostra os jogos ao vivo da Libertadores
!sulamericana - Mostra os jogos ao vivo da Sul-Americana
!brasileirao - Mostra os jogos ao vivo do Brasileirão
!tabelabrasileirao - Mostra a tabela do Brasileirão
!tabelalibertadores - Mostra a tabela da Libertadores

*🎮 Valorant*
!rank [nome#tag] - Mostra o rank de um jogador do Valorant

*🎲 Jogos*
!dado - Rola um dado de 1 a 6
!caraoucoroa - Joga cara ou coroa
!ppt [pedra/papel/tesoura] - Joga pedra, papel ou tesoura contra o bot

*😄 Diversão*
!gato - Mostra uma foto aleatória de um gato

*📱 Outros*
!sticker - Converte uma imagem em sticker
!everyone - Marca todos os membros do grupo
!chat - Inicia uma conversa com o bot
!ping - Verifica se o bot está online
!ajuda - Mostra esta mensagem de ajuda
`;

    await msg.reply(helpMessage);
};

module.exports = helpCommand;
