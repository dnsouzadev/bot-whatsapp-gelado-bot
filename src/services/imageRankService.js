import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMedia, sendReply, sendImage } from './evolutionApi.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/imageRank.json');

// Cache
let imageDb = null;

// Setup flow state
const activeRegistrations = {};

const loadDb = async () => {
    if (imageDb) return imageDb;
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        imageDb = JSON.parse(data);
    } catch (error) {
        imageDb = {
            images: [], // { id, base64, score, sender }
            messageMap: {}, // messageId: imageId (track which message corresponds to which image)
            usage: {} // remoteJid: { date: 'YYYY-MM-DD', count: 0 }
        };
        await saveDb();
    }
    // Backward compatibility for existing DB
    if (!imageDb.usage) imageDb.usage = {};
    return imageDb;
};

const saveDb = async () => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(imageDb, null, 2));
    } catch (error) {
        console.error('Error saving image rank db:', error);
    }
};

// --- Registration Logic ---

export const startImageRegistration = (remoteJid) => {
    activeRegistrations[remoteJid] = true;
};

export const handleImageRegistrationStep = async (instance, remoteJid, message, messageId) => {
    if (!activeRegistrations[remoteJid]) return false;

    try {
        // Check if it's an image
        const isImage = message.message?.imageMessage;
        
        if (!isImage) {
            await sendReply(instance, remoteJid, '❌ Por favor, envie uma imagem.', messageId);
            return true;
        }

        const mediaData = await downloadMedia(instance, message);
        if (!mediaData || !mediaData.base64) {
            await sendReply(instance, remoteJid, '❌ Erro ao baixar a imagem.', messageId);
            return true;
        }

        await loadDb();
        
        const newImage = {
            id: uuidv4(),
            base64: mediaData.base64,
            sender: remoteJid,
            score: 0
        };

        imageDb.images.push(newImage);
        await saveDb();
        
        delete activeRegistrations[remoteJid];
        await sendReply(instance, remoteJid, '✅ Imagem registrada com sucesso!', messageId);
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        delete activeRegistrations[remoteJid];
        return false;
    }
};

// --- Random Image Logic ---

export const sendRandomImage = async (instance, remoteJid) => {
    await loadDb();
    
    // Check usage limit
    const today = new Date().toISOString().split('T')[0];
    const userUsage = imageDb.usage[remoteJid] || { date: today, count: 0 };

    if (userUsage.date !== today) {
        userUsage.date = today;
        userUsage.count = 0;
    }

    if (userUsage.count >= 5) {
        return '🚫 Você já atingiu o limite de 5 imagens aleatórias por dia. Tente novamente amanhã!';
    }

    if (imageDb.images.length === 0) {
        return 'Nenhuma imagem cadastrada.';
    }

    const randomIndex = Math.floor(Math.random() * imageDb.images.length);
    const image = imageDb.images[randomIndex];
    
    // Increment usage
    userUsage.count += 1;
    imageDb.usage[remoteJid] = userUsage;
    await saveDb();
    
    // Sort to find rank
    const sorted = [...imageDb.images].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(img => img.id === image.id) + 1;

    try {
        // Send image
        // We use sendImage which calls the API. 
        // IMPORTANT: The Evolution API response usually contains the message ID (key.id).
        // We need to capture that to track reactions.
        const response = await sendImage(instance, remoteJid, image.base64, `🏆 Rank: #${rank} | ❤️ Reações: ${image.score}\n\nReaja a esta mensagem para votar!`);
        
        // Map the sent message ID to the image ID
        // Note: Response structure depends on Evolution API version. Usually response.key.id
        if (response && response.key && response.key.id) {
            imageDb.messageMap[response.key.id] = image.id;
            await saveDb();
        }
        
    } catch (error) {
        console.error('Error sending random image:', error);
        throw error;
    }
};

// --- Reaction Logic ---

export const handleReaction = async (reactionEvent) => {
    // reactionEvent structure based on Evolution API 'messages.reaction'
    // usually: { key: { remoteJid, fromMe, id }, reaction: { text, key: { ...targetMessageKey } } }
    
    // We need the ID of the message that WAS REACTED TO.
    // data.message.key.id is usually the ID of the reaction message itself
    // data.message.reaction.key.id is the ID of the target message
    
    const targetMessageId = reactionEvent.message?.reaction?.key?.id;
    
    if (!targetMessageId) return;

    await loadDb();

    const imageId = imageDb.messageMap[targetMessageId];
    if (!imageId) return; // Not a tracked image

    const image = imageDb.images.find(img => img.id === imageId);
    if (image) {
        // For simplicity, every reaction counts as +1. 
        // More complex logic could check if user already reacted, etc.
        // Evolution API sends reaction updates (add/remove).
        // If text is empty string, it's a remove.
        
        const reactionText = reactionEvent.message?.reaction?.text;
        
        if (reactionText) {
            image.score += 1;
        } else {
            // Reaction removed
             image.score = Math.max(0, image.score - 1);
        }
        
        await saveDb();
        console.log(`Updated score for image ${imageId}: ${image.score}`);
    }
};

// --- Rank Logic ---

export const getLeaderboard = async () => {
    await loadDb();
    const sorted = [...imageDb.images].sort((a, b) => b.score - a.score).slice(0, 10);
    
    if (sorted.length === 0) return 'Nenhuma imagem no ranking.';

    let msg = '🏆 *Top Imagens Mais Reagidas* 🏆\n\n';
    sorted.forEach((img, index) => {
        msg += `#${index + 1} - ❤️ ${img.score}\n`;
    });
    
    return msg;
};
