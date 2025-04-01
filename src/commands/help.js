const helpCommand = async (msg) => {
    await msg.reply(
        'Comandos disponíveis:\n' +
        '!ola - Saudação\n' +
        '!ajuda - Mostra esta mensagem\n' +
        '!ping - Verifica se o bot está online\n' +
        '!sticker - Converte uma imagem em sticker (envie a imagem junto com o comando)\n' +
        '!rank - Mostra o rank de um jogador do Valorant (use: !rank nome#tag)\n' +
        '!everyone - Marca todos os participantes do grupo\n' +
        '!chat - Conversa com a IA (use: !chat sua mensagem)'
    );
};

module.exports = helpCommand;
