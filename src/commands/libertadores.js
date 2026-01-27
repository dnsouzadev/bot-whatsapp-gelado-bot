import { sendReply } from '../services/evolutionApi.js';

const libertadoresCommand = async (message, instance) => {
    await sendReply(
        instance,
        message.key.remoteJid,
        '⚽ Comando !libertadores - Integre com sua API de futebol preferida',
        message.key.id
    );
};

export default libertadoresCommand;
