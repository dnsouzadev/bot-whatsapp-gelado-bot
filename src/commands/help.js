const helpCommand = async (msg) => {
    await msg.reply(
        'Comandos disponíveis:\n' +
        '!ola - Saudação\n' +
        '!ajuda - Mostra esta mensagem\n' +
        '!ping - Verifica se o bot está online\n' +
        '!sticker - Converte uma imagem em sticker (envie a imagem junto com o comando)\n' +
        '!elo - Checar o elo no valorant'
    );
};

module.exports = helpCommand;
