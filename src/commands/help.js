const helpCommand = async (msg) => {
    await msg.reply(
        'Comandos disponíveis:\n' +
        '!ola - Saudação\n' +
        '!ajuda - Mostra esta mensagem\n' +
        '!ping - Verifica se o bot está online\n' +
        '!sticker - Converte uma imagem em sticker (envie a imagem junto com o comando)\n' +
        '!rank - Mostra o rank de um jogador do Valorant (use: !rank nome#tag)\n' +
        '!everyone - Marca todos os participantes do grupo\n' +
        '!chat - Conversa com a IA (use: !chat sua mensagem)\n' +
        '!libertadores - Mostra os jogos da Libertadores ao vivo\n' +
        '!sulamericana - Mostra os jogos da Sulamericana ao vivo\n' +
        '!brasileirao - Mostra os jogos do Brasileirão ao vivo'
    );
};

module.exports = helpCommand;
