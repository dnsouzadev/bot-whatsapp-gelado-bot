import { sendReply } from '../services/evolutionApi.js';
import { startCreation, getCustomCommand } from '../services/customCommandService.js';

const makeCommand = async (message, instance) => {
    try {
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '';
        
        const args = messageContent.trim().split(/\s+/);
        const commandName = args[1]?.toLowerCase();

        if (!commandName) {
            await sendReply(
                instance,
                message.key.remoteJid,
                '⚠️ Uso correto: !make <nome_do_comando>\nExemplo: !make regras',
                message.key.id
            );
            return;
        }

        // Verifica se já existe (opcional, aqui vou permitir sobrescrever, mas avisando)
        const existing = await getCustomCommand(commandName);
        
        // Inicia o estado de criação
        startCreation(message.key.remoteJid, commandName);

        const msg = existing 
            ? `O comando !${commandName} já existe. Envie a nova resposta para sobrescrevê-lo.`
            : `Ok! Agora envie a mensagem que o bot deve responder quando alguém digitar !${commandName}.`;

        await sendReply(
            instance,
            message.key.remoteJid,
            msg,
            message.key.id
        );

    } catch (error) {
        console.error('Erro no make command:', error);
    }
};

export default makeCommand;
