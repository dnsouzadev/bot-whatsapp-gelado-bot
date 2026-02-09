import { sendReply } from '../services/evolutionApi.js';
import { playLuckyBox } from '../services/imageRankService.js';

const caixaCommand = async (message, instance) => {
    try {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') ||
            message.key.remoteJid?.replace('@s.whatsapp.net', '');
        const result = await playLuckyBox(userNumber);
        await sendReply(instance, message.key.remoteJid, result, message.key.id);
    } catch (error) {
        console.error('Error in caixa command:', error);
        await sendReply(instance, message.key.remoteJid, 'Erro ao abrir a caixa misteriosa.', message.key.id);
    }
};

export default caixaCommand;
