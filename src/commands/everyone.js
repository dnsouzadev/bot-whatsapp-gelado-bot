import { getGroupMetadata, sendMessage } from '../services/evolutionApi.js';

const everyoneCommand = async (message, instance) => {
    try {
        // Busca informações do grupo
        const groupMetadata = await getGroupMetadata(instance, message.key.remoteJid);

        // Pega todos os participantes
        const participants = groupMetadata.participants || [];

        // Cria a lista de menções
        const mentions = participants.map(p => p.id);
        const mentionText = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

        // Envia mensagem marcando todos
        await sendMessage(
            instance,
            message.key.remoteJid,
            `📢 *Atenção todos!*\n\n${mentionText}`,
            mentions
        );
    } catch (error) {
        console.error('Erro ao marcar todos:', error);
        await sendMessage(
            instance,
            message.key.remoteJid,
            'Desculpe, não consegui marcar todos os membros do grupo.'
        );
    }
};

export default everyoneCommand;
