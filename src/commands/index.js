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
import tabelaBrasileiraoCommand from './tabelaBrasileirao.js';
import tabelaLibertadoresCommand from './tabelaLibertadores.js';
import vctamericasCommand from './vctamericas.js';

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
    'brasileirao': brasileiraoCommand,
    'tabelabrasileirao': tabelaBrasileiraoCommand,
    'tabelalibertadores': tabelaLibertadoresCommand,
    'vctamericas': vctamericasCommand
};

const handleCommand = async (message, command, instance) => {
    const commandName = command.split(' ')[0];
    const commandHandler = commands[commandName];

    if (!commandHandler) {
        const { sendReply } = await import('../services/evolutionApi.js');
        await sendReply(
            instance,
            message.key.remoteJid,
            'Comando inválido. Digite !ajuda para ver os comandos disponíveis.',
            message.key.id
        );
        return;
    }

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
};

export default handleCommand;
