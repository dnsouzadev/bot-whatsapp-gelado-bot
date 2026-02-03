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
            images: [], // { id, base64, score, sender, reactions: {} }
            messageMap: {}, // messageId: imageId (track which message corresponds to which image)
            randomUsage: {}, // userNumber: { date: 'YYYY-MM-DD', count: 0 }
            reactionUsage: {} // userNumber: { date: 'YYYY-MM-DD', count: 0 }
        };
        await saveDb();
    }
    // Backward compatibility for existing DB
    if (!imageDb.randomUsage) imageDb.randomUsage = {};
    if (!imageDb.reactionUsage) imageDb.reactionUsage = {};
    if (!imageDb.usage) {
        // Migrate old usage to randomUsage
        imageDb.randomUsage = {};
        imageDb.reactionUsage = {};
    } else {
        delete imageDb.usage;
    }
    // Add reactions field to existing images
    imageDb.images.forEach(img => {
        if (!img.reactions) img.reactions = {};
    });
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

        const caption = message.message?.imageMessage?.caption || 'Sem nome';

        await loadDb();
        
        const newImage = {
            id: uuidv4(),
            base64: mediaData.base64,
            sender: remoteJid,
            name: caption,
            score: 0
        };

        imageDb.images.push(newImage);
        await saveDb();
        
        delete activeRegistrations[remoteJid];
        await sendReply(instance, remoteJid, `✅ Imagem "${caption}" registrada com sucesso!`, messageId);
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        delete activeRegistrations[remoteJid];
        return false;
    }
};

// --- Random Image Logic ---

export const sendRandomImage = async (instance, remoteJid, userNumber) => {
    await loadDb();
    console.log('DB Loaded. Images count:', imageDb.images.length);
    
    const botNumber = process.env.BOT_NUMBER;
    
    // Check if user is the bot (no limit for bot)
    const isBotUser = userNumber === botNumber;
    
    if (!isBotUser) {
        // Check usage limit (10 per day per person)
        const today = new Date().toISOString().split('T')[0];
        const userUsage = imageDb.randomUsage[userNumber] || { date: today, count: 0 };

        if (userUsage.date !== today) {
            userUsage.date = today;
            userUsage.count = 0;
        }

        if (userUsage.count >= 10) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
            const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
            
            return `🚫 Você já atingiu o limite de 10 imagens aleatórias por dia.\n⏰ Resetará em ${hoursUntilReset}h ${minutesUntilReset}min`;
        }

        // Increment usage
        userUsage.count += 1;
        imageDb.randomUsage[userNumber] = userUsage;
        await saveDb();
    }

    if (imageDb.images.length === 0) {
        return 'Nenhuma imagem cadastrada.';
    }

    const randomIndex = Math.floor(Math.random() * imageDb.images.length);
    const image = imageDb.images[randomIndex];
    
    // Sort to find rank
    const sorted = [...imageDb.images].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(img => img.id === image.id) + 1;

    try {
        // Send image
        // We use sendImage which calls the API. 
        // IMPORTANT: The Evolution API response usually contains the message ID (key.id).
        // We need to capture that to track reactions.
        const caption = `🏆 Rank: #${rank}\n📛 Nome: ${image.name || 'Sem nome'}\n❤️ Reações: ${image.score}\n\nReaja a esta mensagem para votar!`;
        const response = await sendImage(instance, remoteJid, image.base64, caption);
        
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

export const handleReaction = async (reactionEvent, instance) => {
    // reactionEvent structure based on Evolution API 'messages.reaction'
    // usually: { key: { remoteJid, fromMe, id, participant }, reaction: { text, key: { ...targetMessageKey } } }
    
    // We need the ID of the message that WAS REACTED TO.
    // data.message.key.id is usually the ID of the reaction message itself
    // data.message.reaction.key.id is the ID of the target message
    
    const targetMessageId = reactionEvent.message?.reaction?.key?.id;
    const userNumber = reactionEvent.key?.participant?.replace('@s.whatsapp.net', '') || 
                       reactionEvent.key?.remoteJid?.replace('@s.whatsapp.net', '');
    const remoteJid = reactionEvent.key?.remoteJid;
    
    if (!targetMessageId || !userNumber) return;

    await loadDb();

    const imageId = imageDb.messageMap[targetMessageId];
    if (!imageId) return; // Not a tracked image

    const image = imageDb.images.find(img => img.id === imageId);
    if (!image) return;

    // Evolution API sends reaction updates (add/remove).
    // If text is empty string, it's a remove.
    const reactionText = reactionEvent.message?.reaction?.text;
    
    if (!image.reactions) image.reactions = {};
    
    if (reactionText) {
        // User is adding a reaction
        
        // Check if user already reacted to this image
        if (image.reactions[userNumber]) {
            console.log(`User ${userNumber} already reacted to image ${imageId}`);
            return;
        }
        
        // Check reaction limit (5 per day per person)
        const today = new Date().toISOString().split('T')[0];
        const userReactionUsage = imageDb.reactionUsage[userNumber] || { date: today, count: 0 };
        
        if (userReactionUsage.date !== today) {
            userReactionUsage.date = today;
            userReactionUsage.count = 0;
        }
        
        if (userReactionUsage.count >= 5) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
            const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
            
            await sendReply(
                instance, 
                remoteJid, 
                `🚫 Você já atingiu o limite de 5 reações por dia.\n⏰ Resetará em ${hoursUntilReset}h ${minutesUntilReset}min`,
                targetMessageId
            );
            return;
        }
        
        // Add reaction
        image.reactions[userNumber] = true;
        image.score += 1;
        
        // Increment reaction usage
        userReactionUsage.count += 1;
        imageDb.reactionUsage[userNumber] = userReactionUsage;
        
        console.log(`User ${userNumber} reacted to image ${imageId}. New score: ${image.score}`);
    } else {
        // Reaction removed
        if (image.reactions[userNumber]) {
            delete image.reactions[userNumber];
            image.score = Math.max(0, image.score - 1);
            
            // Decrement reaction usage
            const today = new Date().toISOString().split('T')[0];
            const userReactionUsage = imageDb.reactionUsage[userNumber];
            if (userReactionUsage && userReactionUsage.date === today) {
                userReactionUsage.count = Math.max(0, userReactionUsage.count - 1);
                imageDb.reactionUsage[userNumber] = userReactionUsage;
            }
            
            console.log(`User ${userNumber} removed reaction from image ${imageId}. New score: ${image.score}`);
        }
    }
    
    await saveDb();
};

// --- Rank Logic ---

export const getLeaderboard = async () => {
    await loadDb();
    const sorted = [...imageDb.images].sort((a, b) => b.score - a.score).slice(0, 10);
    
    if (sorted.length === 0) return 'Nenhuma imagem no ranking.';

    let msg = '🏆 *Top Imagens Mais Reagidas* 🏆\n\n';
    sorted.forEach((img, index) => {
        msg += `#${index + 1} - ${img.name || 'Sem nome'} (❤️ ${img.score})\n`;
    });
    
    return msg;
};
