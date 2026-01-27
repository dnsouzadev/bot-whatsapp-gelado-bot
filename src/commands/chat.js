import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { sendReply } from '../services/evolutionApi.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const chatCommand = async (message, instance) => {
    try {
        // Pega o conteúdo da mensagem
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '';

        // Pega a mensagem após o comando
        const args = messageContent.split(' ');
        const userMessage = args.slice(1).join(' ');

        if (!userMessage) {
            await sendReply(
                instance,
                message.key.remoteJid,
                'Por favor, digite sua mensagem após o comando !chat\nExemplo: !chat Olá, como você está?',
                message.key.id
            );
            return;
        }

        // Faz a requisição para a API do Google Gemini
        const completion = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: userMessage
        });

        // Envia a resposta
        await sendReply(
            instance,
            message.key.remoteJid,
            completion.text,
            message.key.id
        );
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await sendReply(
            instance,
            message.key.remoteJid,
            'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
            message.key.id
        );
    }
};

export default chatCommand;
