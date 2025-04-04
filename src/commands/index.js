const stickerCommand = require('./sticker');
const helpCommand = require('./help');
const pingCommand = require('./ping');
const olaCommand = require('./ola');
const geladoCommand = require('./gelado');
const rankValorantCommand = require('./rankValorant');
const everyoneCommand = require('./everyone');
const chatCommand = require('./chat');
const libertadoresCommand = require('./libertadores');
const sulamericanaCommand = require('./sulamericana');
const brasileiraoCommand = require('./brasileirao');

const commands = {
    'rank': rankValorantCommand,
    'sticker': stickerCommand,
    'ajuda': helpCommand,
    'ping': pingCommand,
    'ola': olaCommand,
    'gelado': geladoCommand,
    'everyone': everyoneCommand,
    // 'chat': chatCommand,
    'libertadores': libertadoresCommand,
    'sulamericana': sulamericanaCommand,
    'brasileirao': brasileiraoCommand
};

const handleCommand = async (msg, comando) => {
    // Pega apenas o primeiro comando, ignorando os argumentos
    const commandName = comando.split(' ')[0];
    const commandHandler = commands[commandName];

    if (commandHandler) {
        await commandHandler(msg);
    } else {
        await msg.reply('Comando não reconhecido. Use !ajuda para ver os comandos disponíveis.');
    }
};

module.exports = { handleCommand };
