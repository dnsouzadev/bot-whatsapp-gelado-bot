const dadoCommand = async (msg) => {
    const resultado = Math.floor(Math.random() * 6) + 1;
    const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    await msg.reply(`🎲 *Resultado do dado:* ${emojis[resultado - 1]} ${resultado}`);
};

module.exports = dadoCommand;
