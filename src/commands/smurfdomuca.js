import { sendReply } from '../services/evolutionApi.js';

const smurfdomucaCommand = async (message, instance) => {
    try {
        const art = `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠛⠛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠁⠄⠄⠄⠄⠄⠄⠄⠈⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢹⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠄⠄⠄⠄⠄⠄⠄⢀⣀⣀⠄⠄⠄⠄⠄⠘⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠄⠄⠄⠄⠄⠄⣸⣿⣿⣿⣿⣷⣄⠄⠄⠄⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠄⠄⠄⠄⠄⠄⠉⠛⠿⣿⠉⠉⣤⣄⠄⠄⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡄⠄⠄⠄⠄⠄⠂⠄⠈⣿⡀⢀⣀⣼⣧⢀⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣧⠄⠄⠄⠠⣶⡆⠄⠄⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣦⠄⠄⠄⠈⠄⠄⢘⡿⢹⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡿⠛⠋⠉⠉⠁⠄⠄⠄⠄⠄⠄⠘⠑⠐⢬⣿⠃⠄⠉⠛⢿⣿⣿⣿⣿⣿⣿
⠛⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢈⣴⢟⣾⠄⠄⠄⠄⠄⠙⠻⠿⣿⣿⣿
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⠄⠄⠄⣉⣥⣾⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠉
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠹⣶⣶⣿⣿⠏⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢤⣿⣿⣿⠋⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄`;

        await sendReply(
            instance,
            message.key.remoteJid,
            art,
            message.key.id
        );
    } catch (error) {
        console.error('Erro ao enviar smurfdomuca:', error);
    }
};

export default smurfdomucaCommand;
