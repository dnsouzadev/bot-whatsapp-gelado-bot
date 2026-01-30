import { sendReply } from '../services/evolutionApi.js';
import { startImageRegistration } from '../services/imageRankService.js';

const registerImageCommand = async (message, instance) => {
    try {
        startImageRegistration(message.key.remoteJid);
        await sendReply(instance, message.key.remoteJid, '📸 Envie a foto que deseja registrar no ranking.\n💡 Dica: Adicione uma legenda na foto para dar um nome a ela!', message.key.id);
    } catch (error) {
        console.error('Error starting register command:', error);
    }
};

export default registerImageCommand;
