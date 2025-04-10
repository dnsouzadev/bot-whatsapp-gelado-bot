const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Importando comandos
const helpCommand = require('./help');
const pingCommand = require('./ping');
const stickerCommand = require('./sticker');
const rankValorantCommand = require('./rankValorant');
const everyoneCommand = require('./everyone');
const chatCommand = require('./chat');
const libertadoresCommand = require('./libertadores');
const sulamericanaCommand = require('./sulamericana');
const brasileiraoCommand = require('./brasileirao');
const tabelaBrasileiraoCommand = require('./tabelaBrasileirao');
const tabelaLibertadoresCommand = require('./tabelaLibertadores');
const dadoCommand = require('./dado');
const caraoucoroaCommand = require('./caraoucoroa');
const pedrapapeltesouraCommand = require('./pedrapapeltesoura');
const gatoCommand = require('./gato');

const commands = {
    'ajuda': helpCommand,
    'ping': pingCommand,
    'sticker': stickerCommand,
    'rank': rankValorantCommand,
    'everyone': everyoneCommand,
    'chat': chatCommand,
    'libertadores': libertadoresCommand,
    'sulamericana': sulamericanaCommand,
    'brasileirao': brasileiraoCommand,
    'tabelabrasileirao': tabelaBrasileiraoCommand,
    'tabelalibertadores': tabelaLibertadoresCommand,
    'dado': dadoCommand,
    'caraoucoroa': caraoucoroaCommand,
    'ppt': pedrapapeltesouraCommand,
    'gato': gatoCommand
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
