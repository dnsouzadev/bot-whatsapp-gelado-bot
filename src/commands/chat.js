const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: "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"
});

const chatCommand = async (msg) => {
    try {
        // Pega a mensagem após o comando
        const args = msg.body.split(' ');
        const userMessage = args.slice(1).join(' ');

        if (!userMessage) {
            await msg.reply('Por favor, digite sua mensagem após o comando !chat\nExemplo: !chat Olá, como você está?');
            return;
        }

        // Envia mensagem de "digitando..."
        await msg.reply('🤔 Pensando...');

        // Faz a requisição para a API do OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    "role": "system",
                    "content": "Você é um assistente amigável e prestativo. Responda de forma clara e concisa."
                },
                {
                    "role": "user",
                    "content": userMessage
                }
            ],
            max_tokens: 500
        });

        // Envia a resposta
        await msg.reply(completion.choices[0].message.content);
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await msg.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.');
    }
};

module.exports = chatCommand;
