import { sendReply } from '../services/evolutionApi.js';

const dadoCommand = async (message, instance) => {
    const resultado = Math.floor(Math.random() * 6) + 1;

    const dados = {
        1: '⚀',
        2: '⚁',
        3: '⚂',
        4: '⚃',
        5: '⚄',
        6: '⚅'
    };

    await sendReply(
        instance,
        message.key.remoteJid,
        `🎲 Você tirou: ${dados[resultado]} (${resultado})`,
        message.key.id
    );
};

export default dadoCommand;
