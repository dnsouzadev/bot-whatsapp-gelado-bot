const everyoneCommand = async (msg) => {
    try {
        // Verifica se a mensagem veio de um grupo
        if (!msg.from.includes('g.us')) {
            await msg.reply('Este comando só pode ser usado em grupos!');
            return;
        }

        const chat = await msg.getChat();

        let text = 'Chamando ';
        let mentions = [];

        for (let participant of chat.participants) {
            mentions.push(`${participant.id.user}@c.us`);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    } catch (error) {
        console.error('Erro ao executar comando everyone:', error);
        await msg.reply('Desculpe, ocorreu um erro ao executar o comando. Tente novamente.');
    }
}

export default everyoneCommand;
