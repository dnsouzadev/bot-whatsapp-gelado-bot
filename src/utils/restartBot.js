const { exec } = require('child_process');

const restartBot = () => {
    console.log('Reiniciando o bot...');
    exec('pm2 restart whatsapp-bot', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao reiniciar o bot: ${error}`);
            return;
        }
        console.log(`Bot reiniciado com sucesso: ${stdout}`);
    });
};

module.exports = restartBot;
