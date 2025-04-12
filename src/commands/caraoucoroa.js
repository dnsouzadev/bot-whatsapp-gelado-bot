const caraoucoroaCommand = async (msg) => {
    const resultado = Math.random() < 0.5 ? 'cara' : 'coroa';
    const emoji = resultado === 'cara' ? '👨' : '🪙';

    await msg.reply(`${emoji} *Resultado:* ${resultado.toUpperCase()}`);
};

export default caraoucoroaCommand;
