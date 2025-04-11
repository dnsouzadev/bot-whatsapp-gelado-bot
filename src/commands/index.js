const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Importando comandos
const helpCommand = require('./help');
const pingCommand = require('./ping');
const chatCommand = require('./chat');
const everyoneCommand = require('./everyone');
const stickerCommand = require('./sticker');
const rankValorantCommand = require('./rankValorant');
const dadoCommand = require('./dado');
const caraoucoroaCommand = require('./caraoucoroa');
const pptCommand = require('./pedrapapeltesoura');
const gatoCommand = require('./gato');
const libertadoresCommand = require('./libertadores');
const sulamericanaCommand = require('./sulamericana');
const brasileiraoCommand = require('./brasileirao');
const tabelaBrasileiraoCommand = require('./tabelaBrasileirao');
const tabelaLibertadoresCommand = require('./tabelaLibertadores');
const vctamericasCommand = require('./vctamericas');

const commands = {
    'ajuda': helpCommand,
    'help': helpCommand,
    'ping': pingCommand,
    'chat': chatCommand,
    'everyone': everyoneCommand,
    'sticker': stickerCommand,
    'rank': rankValorantCommand,
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
