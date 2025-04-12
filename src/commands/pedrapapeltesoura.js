const pedrapapeltesouraCommand = async (msg) => {
    const opcoes = ['pedra', 'papel', 'tesoura'];
    const emojis = {
        'pedra': '🪨',
        'papel': '📄',
        'tesoura': '✂️'
    };

    const escolhaBot = opcoes[Math.floor(Math.random() * 3)];
    const escolhaUsuario = msg.body.split(' ')[1]?.toLowerCase();

    if (!escolhaUsuario || !opcoes.includes(escolhaUsuario)) {
        await msg.reply('❌ Escolha inválida! Use: !ppt pedra, !ppt papel ou !ppt tesoura');
        return;
    }

    let resultado;
    if (escolhaUsuario === escolhaBot) {
        resultado = 'Empate!';
    } else if (
        (escolhaUsuario === 'pedra' && escolhaBot === 'tesoura') ||
        (escolhaUsuario === 'papel' && escolhaBot === 'pedra') ||
        (escolhaUsuario === 'tesoura' && escolhaBot === 'papel')
    ) {
        resultado = 'Você ganhou! 🎉';
    } else {
        resultado = 'Você perdeu! 😢';
    }

    await msg.reply(
        `*Pedra, Papel ou Tesoura!*\n\n` +
        `Você: ${emojis[escolhaUsuario]} ${escolhaUsuario}\n` +
        `Bot: ${emojis[escolhaBot]} ${escolhaBot}\n\n` +
        `*Resultado:* ${resultado}`
    );
};

export default pedrapapeltesouraCommand;
