import { sendReply } from '../services/evolutionApi.js';

const sulamericanaCommand = async (message, instance) => {
    await sendReply(
        instance,
        message.key.remoteJid,
        '⚽ Comando !sulamericana - Integre com sua API de futebol preferida',
        message.key.id
    );
};

export default sulamericanaCommand;
