import { sendReply } from '../services/evolutionApi.js';

const vctamericasCommand = async (message, instance) => {
    await sendReply(
        instance,
        message.key.remoteJid,
        '🎮 Comando !vctamericas - Integre com API do Valorant Esports',
        message.key.id
    );
};

export default vctamericasCommand;
