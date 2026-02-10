import { sendReply } from '../services/evolutionApi.js';
import { playMeteorStorm } from '../services/imageRankService.js';

const meteoroCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const result = await playMeteorStorm(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in meteoro command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao chamar a chuva de meteoros.', message.key.id);
    }
};

export default meteoroCommand;
