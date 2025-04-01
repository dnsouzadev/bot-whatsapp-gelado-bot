const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const client = require('./src/config/client');
const { handleCommand } = require('./src/commands');

// Criar uma nova instância do cliente WhatsApp
const clientWhatsApp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Gerar QR Code no terminal
clientWhatsApp.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie-o com seu WhatsApp.');
});

// Quando o cliente estiver pronto
clientWhatsApp.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

// Quando receber uma mensagem
clientWhatsApp.on('message', async msg => {
    // Ignorar mensagens do sistema
    if (msg.isStatus) return;

    const mentions = await msg.getMentions();

    for (let user of mentions) {
        await msg.reply("q q foi meu fi")
    }

    console.log('Mensagem recebida:', msg.body);

    // Processar comandos
    if (msg.body.startsWith('!')) {
        const comando = msg.body.slice(1).toLowerCase();
        await handleCommand(msg, comando);
    }
});

// Iniciar o cliente
clientWhatsApp.initialize();
