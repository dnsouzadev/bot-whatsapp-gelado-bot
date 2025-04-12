import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const chatCommand = async (msg) => {
    try {
        // Pega a mensagem após o comando
        const args = msg.body.split(' ');
        const userMessage = args.slice(1).join(' ');

        if (!userMessage) {
            await msg.reply('Por favor, digite sua mensagem após o comando !chat\nExemplo: !chat Olá, como você está?');
            return;
        }

        // Faz a requisição para a API do OpenAI
        const completion = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: userMessage
        });



        // Envia a resposta
        await msg.reply(completion.text);
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await msg.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.');
    }
};

export default chatCommand;
