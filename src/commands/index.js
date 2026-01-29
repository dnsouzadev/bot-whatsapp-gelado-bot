import brasileiraoCommand from './brasileirao.js';
import caraoucoroaCommand from './caraoucoroa.js';
import chatCommand from './chat.js';
import dadoCommand from './dado.js';
import everyoneCommand from './everyone.js';
import gatoCommand from './gato.js';
import helpCommand from './help.js';
import libertadoresCommand from './libertadores.js';
import pptCommand from './pedrapapeltesoura.js';
import pingCommand from './ping.js';
import rankValorantCommand from './rankValorant.js';
import stickerCommand from './sticker.js';
import sulamericanaCommand from './sulamericana.js';
import smurfdomucaCommand from './smurfdomuca.js';
import tabelaBrasileiraoCommand from './tabelaBrasileirao.js';
import tabelaLibertadoresCommand from './tabelaLibertadores.js';
import vctamericasCommand from './vctamericas.js';
import makeCommand from './make.js';
import { getCustomCommand } from '../services/customCommandService.js';

const commands = {
    'ajuda': helpCommand,
    'help': helpCommand,
    'ping': pingCommand,
    'chat': chatCommand,
    'everyone': everyoneCommand,
    'rank': rankValorantCommand,
    'sticker': stickerCommand,
    'dado': dadoCommand,
    'caraoucoroa': caraoucoroaCommand,
    'ppt': pptCommand,
    'gato': gatoCommand,
    'libertadores': libertadoresCommand,
    'sulamericana': sulamericanaCommand,
    'smurfdomuca': smurfdomucaCommand,
    'brasileirao': brasileiraoCommand,
    'tabelabrasileirao': tabelaBrasileiraoCommand,
    'tabelalibertadores': tabelaLibertadoresCommand,
    'vctamericas': vctamericasCommand,
    'make': makeCommand
};

const handleCommand = async (message, command, instance) => {
    const commandName = command.split(' ')[0];
    const commandHandler = commands[commandName];

    // Se tiver handler nativo, executa
    if (commandHandler) {
        try {
            await commandHandler(message, instance);
        } catch (error) {
            console.error('Erro ao processar comando:', error);
            const { sendReply } = await import('../services/evolutionApi.js');
            await sendReply(
                instance,
                message.key.remoteJid,
                'Ocorreu um erro ao processar o comando. Tente novamente mais tarde.',
                message.key.id
            );
        }
        return;
    }

    // Se não tiver nativo, procura nos customizados
    try {
        const customData = await getCustomCommand(commandName);
        if (customData) {
            const { sendReply, sendSticker } = await import('../services/evolutionApi.js');
            
            if (typeof customData === 'string') {
                // Legado (apenas texto)
                await sendReply(instance, message.key.remoteJid, customData, message.key.id);
            } else if (customData.type === 'sticker') {
                // Sticker
                await sendSticker(instance, message.key.remoteJid, customData.content);
            } else {
                // Texto (objeto novo)
                await sendReply(instance, message.key.remoteJid, customData.content, message.key.id);
            }
            return;
        }
    } catch (error) {
        console.error('Erro ao buscar custom command:', error);
    }

    // Se não achou nada
    const { sendReply } = await import('../services/evolutionApi.js');
    await sendReply(
        instance,
        message.key.remoteJid,
        'Comando inválido. Digite !ajuda para ver os comandos disponíveis.',
        message.key.id
    );
};

export default handleCommand;
