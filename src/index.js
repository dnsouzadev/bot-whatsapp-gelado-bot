const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const commands = require('./commands');
const restartBot = require('./utils/restartBot');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome'
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

client.on('message', async (msg) => {
    try {
        const command = msg.body.split(' ')[0].toLowerCase();
        if (commands[command]) {
            await commands[command](msg);
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        if (error.message.includes('Execution context was destroyed')) {
            console.log('Detectado erro de contexto destruído, reiniciando bot...');
            restartBot();
        }
    }
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    restartBot();
});

client.initialize().catch(err => {
    console.error('Erro ao inicializar cliente:', err);
    restartBot();
});
