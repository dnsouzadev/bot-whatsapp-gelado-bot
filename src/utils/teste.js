import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Porta:', process.env.PORT);
console.log('API Key:', process.env.GOOGLE_API_KEY ? 'Configurada' : 'Não configurada');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "oi, tudo bem?",
        });
        console.log('Resposta:', response.text);
    } catch (error) {
        console.error('Erro ao gerar conteúdo:', error);
    }
}

main();
