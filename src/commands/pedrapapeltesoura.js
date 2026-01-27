import { sendReply } from '../services/evolutionApi.js';

const pptCommand = async (message, instance) => {
    const messageContent = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || '';

    const args = messageContent.split(' ');
    const escolhaUsuario = args[1]?.toLowerCase();
    const opcoes = ['pedra', 'papel', 'tesoura'];

    if (!escolhaUsuario || !opcoes.includes(escolhaUsuario)) {
        await sendReply(
            instance,
            message.key.remoteJid,
            'Escolha uma opção válida: !ppt pedra, !ppt papel ou !ppt tesoura',
            message.key.id
        );
        return;
    }

    const escolhaBot = opcoes[Math.floor(Math.random() * 3)];
    let resultado = '';

    if (escolhaUsuario === escolhaBot) {
        resultado = `Empate! Eu também escolhi ${escolhaBot}.`;
    } else if (
        (escolhaUsuario === 'pedra' && escolhaBot === 'tesoura') ||
        (escolhaUsuario === 'papel' && escolhaBot === 'pedra') ||
        (escolhaUsuario === 'tesoura' && escolhaBot === 'papel')
    ) {
        resultado = `Você ganhou! Eu escolhi ${escolhaBot}.`;
    } else {
        resultado = `Você perdeu! Eu escolhi ${escolhaBot}.`;
    }

    await sendReply(
        instance,
        message.key.remoteJid,
        resultado,
        message.key.id
    );
};

export default pptCommand;
