import { sendReply } from '../services/evolutionApi.js';

const caraoucoroaCommand = async (message, instance) => {
    const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
    const emoji = resultado === 'Cara' ? '🪙' : '💰';

    await sendReply(
        instance,
        message.key.remoteJid,
        `${emoji} Resultado: *${resultado}*!`,
        message.key.id
    );
};

export default caraoucoroaCommand;
