const stickerCommand = require('./sticker');
const helpCommand = require('./help');
const pingCommand = require('./ping');
const olaCommand = require('./ola');
const geladoCommand = require('./gelado');

const commands = {
    'sticker': stickerCommand,
    'ajuda': helpCommand,
    'ping': pingCommand,
    'ola': olaCommand,
    'gelado': geladoCommand
};

const handleCommand = async (msg, comando) => {
    const commandHandler = commands[comando];

    if (commandHandler) {
        await commandHandler(msg);
    } else {
        await msg.reply('Comando não reconhecido. Use !ajuda para ver os comandos disponíveis.');
    }
};

module.exports = { handleCommand };
