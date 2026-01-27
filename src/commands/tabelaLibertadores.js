import { sendReply } from '../services/evolutionApi.js';

const tabelaLibertadoresCommand = async (message, instance) => {
    await sendReply(
        instance,
        message.key.remoteJid,
        '📊 Comando !tabelalibertadores - Integre com sua API de futebol preferida',
        message.key.id
    );
};

export default tabelaLibertadoresCommand;
