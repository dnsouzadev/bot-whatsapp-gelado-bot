import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Cliente axios configurado
const api = axios.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
    }
});

/**
 * Envia uma mensagem de texto
 */
export const sendMessage = async (instance, remoteJid, text) => {
    try {
        const response = await api.post(`/message/sendText/${instance}`, {
            number: remoteJid,
            text: text
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Envia uma resposta (reply) a uma mensagem específica
 */
export const sendReply = async (instance, remoteJid, text, messageId) => {
    try {
        const response = await api.post(`/message/sendText/${instance}`, {
            number: remoteJid,
            text: text,
            quoted: {
                key: {
                    remoteJid: remoteJid,
                    fromMe: false,
                    id: messageId
                }
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar reply:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Envia uma imagem
 */
export const sendImage = async (instance, remoteJid, imageUrl, caption = '') => {
    try {
        const response = await api.post(`/message/sendMedia/${instance}`, {
            number: remoteJid,
            mediatype: 'image',
            media: imageUrl,
            caption: caption
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar imagem:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Envia um sticker
 */
export const sendSticker = async (instance, remoteJid, stickerData) => {
    try {
        const response = await api.post(`/message/sendSticker/${instance}`, {
            number: remoteJid,
            sticker: stickerData
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar sticker:', JSON.stringify(error.response?.data || error.message, null, 2));
        throw error;
    }
};

/**
 * Pega informações do grupo
 */
export const getGroupMetadata = async (instance, groupJid) => {
    try {
        const response = await api.get(`/group/findGroupInfo/${instance}`, {
            params: { groupJid }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar metadata do grupo:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Converte mídia de uma mensagem para Base64
 */
export const downloadMedia = async (instance, messageData, convertToMp4 = false) => {
    try {
        // Endpoint para buscar o base64 de uma mensagem de mídia
        const response = await api.post(`/chat/getBase64FromMediaMessage/${instance}`, {
            message: messageData,
            convertToMp4: convertToMp4
        });
        
        return response.data; 
    } catch (error) {
        console.error('Erro ao converter mídia:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    sendMessage,
    sendReply,
    sendImage,
    sendSticker,
    getGroupMetadata,
    downloadMedia
};
