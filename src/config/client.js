const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Criar uma nova instância do cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Gerar QR Code no terminal
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie-o com seu WhatsApp.');
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

module.exports = client;
