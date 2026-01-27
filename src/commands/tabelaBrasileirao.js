import { sendReply } from '../services/evolutionApi.js';

const tabelaBrasileiraoCommand = async (message, instance) => {
    await sendReply(
        instance,
        message.key.remoteJid,
        '📊 Comando !tabelabrasileirao - Integre com sua API de futebol preferida',
        message.key.id
    );
};

export default tabelaBrasileiraoCommand;
