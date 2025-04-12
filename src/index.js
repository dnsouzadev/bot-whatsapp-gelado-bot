import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import handleCommand from './commands/index.js';
const { Client, LocalAuth } = pkg;

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
    const botNumber = clientWhatsApp.info.wid._serialized;

    // Verifica se o bot foi mencionado
    const botMentioned = mentions.some(user => user.id._serialized === botNumber);

    if (botMentioned) {
        await msg.reply("Desculpe, não comerei seu fundo");
    }

    console.log('Mensagem recebida do numero:', msg.from);
    console.log('Mensagem recebida:', msg.body);

    // Processar comandos
    if (msg.body.startsWith('!')) {
        const comando = msg.body.slice(1).toLowerCase();
        await handleCommand(msg, comando);
    }
});

// Iniciar o cliente
clientWhatsApp.initialize();
