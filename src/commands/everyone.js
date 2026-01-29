import { getGroupMetadata, sendMessage } from '../services/evolutionApi.js';

const everyoneCommand = async (message, instance) => {
    try {
        // Busca informações do grupo
        const groupMetadata = await getGroupMetadata(instance, message.key.remoteJid);
        
        console.log('Group Metadata:', JSON.stringify(groupMetadata, null, 2));

        // Pega todos os participantes (tenta tratar se for array ou objeto)
        const data = Array.isArray(groupMetadata) ? groupMetadata[0] : groupMetadata;
        const participants = data?.participants || [];

        if (participants.length === 0) {
            await sendMessage(instance, message.key.remoteJid, 'Não encontrei participantes neste grupo.');
            return;
        }

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
