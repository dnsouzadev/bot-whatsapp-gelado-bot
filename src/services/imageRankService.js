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
    // Force reload on every call to ensure data persistence
    imageDb = null;
    
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        imageDb = JSON.parse(data);
        
        // Migration and backward compatibility
        let needsSave = false;
        
        // Add missing fields
        if (!imageDb.images) {
            imageDb.images = [];
            needsSave = true;
        }
        if (!imageDb.messageMap) {
            imageDb.messageMap = {};
            needsSave = true;
        }
        if (!imageDb.messageReactions) {
            imageDb.messageReactions = {};
            needsSave = true;
        }
        if (!imageDb.randomUsage) {
            imageDb.randomUsage = {};
            needsSave = true;
        }
        if (!imageDb.reactionUsage) {
            imageDb.reactionUsage = {};
            needsSave = true;
        }
        if (!imageDb.diceUsage) {
            imageDb.diceUsage = {}; // userNumber: { date: 'YYYY-MM-DD', morning: bool, afternoon: bool, night: bool }
            needsSave = true;
        }
        if (!imageDb.rouletteUsage) {
            imageDb.rouletteUsage = {};
            needsSave = true;
        }
        if (!imageDb.giftUsage) {
            imageDb.giftUsage = {};
            needsSave = true;
        }
        if (!imageDb.luckyBoxUsage) {
            imageDb.luckyBoxUsage = {};
            needsSave = true;
        }
        if (!imageDb.scratchUsage) {
            imageDb.scratchUsage = {};
            needsSave = true;
        }
        if (!imageDb.treasureUsage) {
            imageDb.treasureUsage = {};
            needsSave = true;
        }
        if (!imageDb.slotUsage) {
            imageDb.slotUsage = {};
            needsSave = true;
        }
        if (!imageDb.meteorUsage) {
            imageDb.meteorUsage = {};
            needsSave = true;
        }
        if (!imageDb.bannedUsers) {
            imageDb.bannedUsers = {};
            needsSave = true;
        }
        if (!imageDb.activeDuels) {
            imageDb.activeDuels = {};
            needsSave = true;
        }
        
        // Remove old 'diceUsed' field if it exists
        if (imageDb.diceUsed) {
            console.log('⚠️ Migrating old "diceUsed" field to new "diceUsage" system...');
            delete imageDb.diceUsed;
            needsSave = true;
        }
        
        // Remove old 'usage' field if it exists
        if (imageDb.usage) {
            console.log('⚠️ Migrating old "usage" field...');
            delete imageDb.usage;
            needsSave = true;
        }
        
        // Add reactions field to existing images
        imageDb.images.forEach(img => {
            if (!img.reactions) {
                img.reactions = {};
                needsSave = true;
            }
        });
        
        if (needsSave) {
            console.log('💾 Migrating database structure...');
            await saveDb();
            console.log('✅ Migration complete!');
        }
        
    } catch (error) {
        console.log('📝 Creating new database...');
        imageDb = {
            images: [],
            messageMap: {},
            messageReactions: {},
            randomUsage: {},
            reactionUsage: {},
            diceUsage: {},
            rouletteUsage: {}, // Same as dice - 3 per day
            giftUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            luckyBoxUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            scratchUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            treasureUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            slotUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            meteorUsage: {}, // userNumber: { date: 'YYYY-MM-DD', used: bool }
            bannedUsers: {}, // userNumber: { reason: string, until: timestamp or null for permanent }
            activeDuels: {} // remoteJid: { challenger: userNumber, challenged: userNumber, challengerChoice: string }
        };
        await saveDb();
    }
    
    return imageDb;
};

const saveDb = async () => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(imageDb, null, 2));
    } catch (error) {
        console.error('Error saving image rank db:', error);
    }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getToday = () => new Date().toISOString().split('T')[0];

const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
    return { hoursUntilReset, minutesUntilReset };
};

const getDailyUsage = (usageMap, userNumber, today) => {
    const usage = usageMap[userNumber] || { date: today, used: false };
    if (usage.date !== today) {
        usage.date = today;
        usage.used = false;
    }
    return usage;
};

const applyUsagePrize = (userNumber, prize, today) => {
    const userRandom = imageDb.randomUsage[userNumber] || { date: today, count: 0 };
    const userReaction = imageDb.reactionUsage[userNumber] || { date: today, count: 0 };

    if (userRandom.date !== today) {
        userRandom.date = today;
        userRandom.count = 0;
    }
    if (userReaction.date !== today) {
        userReaction.date = today;
        userReaction.count = 0;
    }

    userRandom.count = clamp(userRandom.count - prize.random, 0, 10);
    userReaction.count = clamp(userReaction.count - prize.reactions, 0, 5);

    imageDb.randomUsage[userNumber] = userRandom;
    imageDb.reactionUsage[userNumber] = userReaction;
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
    console.log('🔍 RANDOM SERVICE - userNumber received:', userNumber);
    
    // Check usage limit (10 per day per person)
    const today = new Date().toISOString().split('T')[0];
    const userUsage = imageDb.randomUsage[userNumber] || { date: today, count: 0 };

    console.log('📊 Current usage for', userNumber, ':', userUsage);

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
    console.log(`💾 Saving random usage for ${userNumber}: count=${userUsage.count}, date=${userUsage.date}`);
    await saveDb();
    console.log(`✅ Random usage saved successfully`);
    console.log('📋 All randomUsage keys:', Object.keys(imageDb.randomUsage));

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
        console.log('📤 sendImage response:', JSON.stringify(response, null, 2));
        if (response && response.key && response.key.id) {
            console.log('✅ Mapping message ID', response.key.id, 'to image ID', image.id);
            imageDb.messageMap[response.key.id] = image.id;
            await saveDb();
        } else {
            console.log('⚠️ Response does not have key.id, cannot map message');
        }
        
    } catch (error) {
        console.error('Error sending random image:', error);
        throw error;
    }
};

// --- Reaction Logic ---

export const handleReaction = async (reactionEvent, instance) => {
    console.log('🔍 handleReaction called with event:', JSON.stringify(reactionEvent, null, 2));
    
    // Structure from Evolution API via messages.upsert with messageType: reactionMessage
    // reactionEvent.key.participant = who reacted
    // reactionEvent.message.reaction.key.id = target message ID
    // reactionEvent.message.reaction.text = emoji (empty if removed)
    
    const targetMessageId = reactionEvent.message?.reaction?.key?.id;
    const userNumber = reactionEvent.key?.participant?.replace('@lid', '').replace('@s.whatsapp.net', '');
    const remoteJid = reactionEvent.key?.remoteJid;
    
    console.log('📌 Target Message ID:', targetMessageId);
    console.log('👤 User Number:', userNumber);
    console.log('💬 Remote JID:', remoteJid);
    
    if (!targetMessageId || !userNumber) {
        console.log('❌ Missing targetMessageId or userNumber, returning');
        return;
    }

    await loadDb();

    console.log('📋 Current messageMap:', imageDb.messageMap);
    const imageId = imageDb.messageMap[targetMessageId];
    console.log('🖼️ Found imageId:', imageId);
    
    if (!imageId) {
        console.log('❌ No image found for targetMessageId:', targetMessageId);
        return; // Not a tracked image
    }

    const image = imageDb.images.find(img => img.id === imageId);
    if (!image) {
        console.log('❌ Image not found in database for imageId:', imageId);
        return;
    }
    
    console.log('✅ Found image:', image.name, 'Current score:', image.score);

    // Evolution API sends reaction updates (add/remove).
    // If text is empty string, it's a remove.
    const reactionText = reactionEvent.message?.reaction?.text;
    const messageReactions = imageDb.messageReactions[targetMessageId] || {};
    
    if (reactionText) {
        // User is adding a reaction
        
        // Check if user already reacted to this specific message
        if (messageReactions[userNumber]) {
            console.log(`User ${userNumber} already reacted to message ${targetMessageId}`);
            return;
        }
        
        // Check reaction limit (5 per day per person)
        const today = getToday();
        const userReactionUsage = imageDb.reactionUsage[userNumber] || { date: today, count: 0 };
        
        if (userReactionUsage.date !== today) {
            userReactionUsage.date = today;
            userReactionUsage.count = 0;
        }
        
        if (userReactionUsage.count >= 5) {
            // Limite atingido, apenas ignora silenciosamente
            console.log(`User ${userNumber} reached reaction limit (5/day)`);
            return;
        }
        
        // Increment reaction usage
        userReactionUsage.count += 1;
        imageDb.reactionUsage[userNumber] = userReactionUsage;
        
        // Add reaction
        messageReactions[userNumber] = true;
        imageDb.messageReactions[targetMessageId] = messageReactions;
        image.score += 1;
        
        console.log(`User ${userNumber} reacted to image ${imageId}. New score: ${image.score}`);
    } else {
        // Reaction removed
        if (messageReactions[userNumber]) {
            delete messageReactions[userNumber];
            if (Object.keys(messageReactions).length === 0) {
                delete imageDb.messageReactions[targetMessageId];
            } else {
                imageDb.messageReactions[targetMessageId] = messageReactions;
            }
            image.score = Math.max(0, image.score - 1);
            
            // Decrement reaction usage
            const today = getToday();
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
    
    if (sorted.length === 0) return { text: 'Nenhuma imagem no ranking.', topImage: null };

    const medals = ['🥇', '🥈', '🥉'];
    const totalReactions = sorted.reduce((sum, img) => sum + img.score, 0);
    
    let msg = '╔═══════════════════════╗\n';
    msg += '║   🏆 *RANKING DE IMAGENS* 🏆   ║\n';
    msg += '╚═══════════════════════╝\n\n';
    
    sorted.forEach((img, index) => {
        const position = index + 1;
        const medal = medals[index] || `${position}º`;
        const percentage = totalReactions > 0 ? ((img.score / totalReactions) * 100).toFixed(1) : 0;
        const reactionCount = img.score;
        
        // Progress bar (10 chars max)
        const barLength = Math.min(Math.round((img.score / (sorted[0]?.score || 1)) * 10), 10);
        const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
        
        msg += `${medal} *${img.name || 'Sem nome'}*\n`;
        msg += `   ❤️ ${reactionCount} reações (${percentage}%)\n`;
        msg += `   ${bar}\n`;
        
        if (index < sorted.length - 1) msg += '\n';
    });
    
    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 Total: ${sorted.length} imagens\n`;
    msg += `💖 ${totalReactions} reações no total`;
    
    return {
        text: msg,
        topImage: sorted[0] || null
    };
};

// --- Dice Logic ---

export const playDice = async (userNumber, chosenNumber) => {
    await loadDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine current period
    let period, periodName, periodEmoji;
    if (currentHour < 12) {
        period = 'morning';
        periodName = 'Manhã';
        periodEmoji = '🌅';
    } else if (currentHour < 18) {
        period = 'afternoon';
        periodName = 'Tarde';
        periodEmoji = '☀️';
    } else {
        period = 'night';
        periodName = 'Noite';
        periodEmoji = '🌙';
    }
    
    // Get or create user dice usage
    const userDice = imageDb.diceUsage[userNumber] || { 
        date: today, 
        morning: false, 
        afternoon: false, 
        night: false 
    };
    
    // Reset if new day
    if (userDice.date !== today) {
        userDice.date = today;
        userDice.morning = false;
        userDice.afternoon = false;
        userDice.night = false;
    }
    
    // Check if already used in this period
    if (userDice[period]) {
        // Calculate when next period starts
        let nextPeriodStart, nextPeriodName;
        if (period === 'morning') {
            nextPeriodStart = new Date(now);
            nextPeriodStart.setHours(12, 0, 0, 0);
            nextPeriodName = '☀️ Tarde (12:00)';
        } else if (period === 'afternoon') {
            nextPeriodStart = new Date(now);
            nextPeriodStart.setHours(18, 0, 0, 0);
            nextPeriodName = '🌙 Noite (18:00)';
        } else {
            // Night - next is tomorrow morning
            nextPeriodStart = new Date(now);
            nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
            nextPeriodStart.setHours(0, 0, 0, 0);
            nextPeriodName = '🌅 Manhã (00:00)';
        }
        
        const hoursUntil = Math.floor((nextPeriodStart - now) / (1000 * 60 * 60));
        const minutesUntil = Math.floor(((nextPeriodStart - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `🎲 Você já usou seu dado da ${periodName} ${periodEmoji}\n\n⏰ Próximo período: ${nextPeriodName}\n🕐 Disponível em: ${hoursUntil}h ${minutesUntil}min`;
    }
    
    // Validate chosen number
    const choice = parseInt(chosenNumber);
    if (isNaN(choice) || choice < 1 || choice > 6) {
        return `❌ Escolha um número entre 1 e 6.\nExemplo: !dice 3\n\n${periodEmoji} Período atual: ${periodName}`;
    }
    
    // Roll the dice
    const rolled = Math.floor(Math.random() * 6) + 1;
    
    // Mark period as used
    userDice[period] = true;
    imageDb.diceUsage[userNumber] = userDice;
    
    if (rolled === choice) {
        // Winner! Reset limits
        imageDb.randomUsage[userNumber] = { date: today, count: 0 };
        imageDb.reactionUsage[userNumber] = { date: today, count: 0 };
        await saveDb();
        
        return `${periodEmoji} *${periodName.toUpperCase()}*\n\n🎲 Você escolheu: ${choice}\n🎯 Resultado: ${rolled}\n\n🎉 *PARABÉNS!* Você acertou!\n✨ Seus limites foram resetados!`;
    } else {
        // Lost
        await saveDb();
        
        return `${periodEmoji} *${periodName.toUpperCase()}*\n\n🎲 Você escolheu: ${choice}\n🎯 Resultado: ${rolled}\n\n😢 Que pena! Você errou.\n🔄 Tente no próximo período!`;
    }
};

// --- Roulette Logic ---

export const playRoulette = async (userNumber) => {
    await loadDb();
    
    const today = getToday();
    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine current period
    let period, periodName, periodEmoji;
    if (currentHour < 12) {
        period = 'morning';
        periodName = 'Manhã';
        periodEmoji = '🌅';
    } else if (currentHour < 18) {
        period = 'afternoon';
        periodName = 'Tarde';
        periodEmoji = '☀️';
    } else {
        period = 'night';
        periodName = 'Noite';
        periodEmoji = '🌙';
    }
    
    // Get or create user roulette usage
    const userRoulette = imageDb.rouletteUsage[userNumber] || { 
        date: today, 
        morning: false, 
        afternoon: false, 
        night: false 
    };
    
    // Reset if new day
    if (userRoulette.date !== today) {
        userRoulette.date = today;
        userRoulette.morning = false;
        userRoulette.afternoon = false;
        userRoulette.night = false;
    }
    
    // Check if already used in this period
    if (userRoulette[period]) {
        let nextPeriodStart, nextPeriodName;
        if (period === 'morning') {
            nextPeriodStart = new Date(now);
            nextPeriodStart.setHours(12, 0, 0, 0);
            nextPeriodName = '☀️ Tarde (12:00)';
        } else if (period === 'afternoon') {
            nextPeriodStart = new Date(now);
            nextPeriodStart.setHours(18, 0, 0, 0);
            nextPeriodName = '🌙 Noite (18:00)';
        } else {
            nextPeriodStart = new Date(now);
            nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
            nextPeriodStart.setHours(0, 0, 0, 0);
            nextPeriodName = '🌅 Manhã (00:00)';
        }
        
        const hoursUntil = Math.floor((nextPeriodStart - now) / (1000 * 60 * 60));
        const minutesUntil = Math.floor(((nextPeriodStart - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `🎰 Você já usou sua roleta da ${periodName} ${periodEmoji}\n\n⏰ Próximo período: ${nextPeriodName}\n🕐 Disponível em: ${hoursUntil}h ${minutesUntil}min`;
    }
    
    // Mark period as used
    userRoulette[period] = true;
    imageDb.rouletteUsage[userNumber] = userRoulette;
    
    // Roulette prizes
    const prizes = [
        { emoji: '💎', name: 'JACKPOT', random: 5, reactions: 3 },
        { emoji: '🎉', name: 'GRANDE PRÊMIO', random: 3, reactions: 2 },
        { emoji: '⭐', name: 'Prêmio Bom', random: 2, reactions: 1 },
        { emoji: '🍀', name: 'Sorte Média', random: 1, reactions: 1 },
        { emoji: '😐', name: 'Quase', random: 0, reactions: 0 },
        { emoji: '💀', name: 'PERDEU', random: -2, reactions: -1 }
    ];
    
    const weights = [5, 10, 20, 30, 25, 10]; // % de chance
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[4]; // Default
    
    for (let i = 0; i < prizes.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
            selectedPrize = prizes[i];
            break;
        }
    }
    
    // Apply prize
    const userRandom = imageDb.randomUsage[userNumber] || { date: today, count: 0 };
    const userReaction = imageDb.reactionUsage[userNumber] || { date: today, count: 0 };
    
    if (userRandom.date !== today) {
        userRandom.date = today;
        userRandom.count = 0;
    }
    if (userReaction.date !== today) {
        userReaction.date = today;
        userReaction.count = 0;
    }
    
    userRandom.count = Math.max(0, Math.min(10, userRandom.count - selectedPrize.random));
    userReaction.count = Math.max(0, Math.min(5, userReaction.count - selectedPrize.reactions));
    
    imageDb.randomUsage[userNumber] = userRandom;
    imageDb.reactionUsage[userNumber] = userReaction;
    await saveDb();
    
    let msg = `${periodEmoji} *${periodName.toUpperCase()}*\n\n`;
    msg += `🎰 *ROLETA DA SORTE* 🎰\n\n`;
    msg += `${selectedPrize.emoji} *${selectedPrize.name}* ${selectedPrize.emoji}\n\n`;
    
    if (selectedPrize.random > 0) msg += `🎲 +${selectedPrize.random} !random\n`;
    else if (selectedPrize.random < 0) msg += `🎲 ${selectedPrize.random} !random\n`;
    
    if (selectedPrize.reactions > 0) msg += `❤️ +${selectedPrize.reactions} reações\n`;
    else if (selectedPrize.reactions < 0) msg += `❤️ ${selectedPrize.reactions} reações\n`;
    
    if (selectedPrize.random === 0 && selectedPrize.reactions === 0) {
        msg += `😐 Nada aconteceu...`;
    }
    
    return msg;
};

// --- Giveaways Logic ---

const formatPrizeLines = (prize) => {
    const lines = [];
    if (prize.random > 0) lines.push(`🎲 +${prize.random} !random`);
    else if (prize.random < 0) lines.push(`🎲 ${prize.random} !random`);

    if (prize.reactions > 0) lines.push(`❤️ +${prize.reactions} reações`);
    else if (prize.reactions < 0) lines.push(`❤️ ${prize.reactions} reações`);

    if (lines.length === 0) lines.push('😐 Nada aconteceu...');
    return lines.join('\n');
};

export const playLuckyBox = async (userNumber) => {
    await loadDb();
    const today = getToday();
    const usage = getDailyUsage(imageDb.luckyBoxUsage, userNumber, today);

    if (usage.used) {
        const { hoursUntilReset, minutesUntilReset } = getTimeUntilReset();
        return `🎁 Você já abriu sua *Caixa Misteriosa* hoje!\n⏰ Disponível em: ${hoursUntilReset}h ${minutesUntilReset}min`;
    }

    const prizes = [
        { emoji: '💎', name: 'Super Caixa', random: 3, reactions: 2 },
        { emoji: '🎉', name: 'Boa Caixa', random: 2, reactions: 1 },
        { emoji: '🍀', name: 'Sorte', random: 1, reactions: 1 },
        { emoji: '😐', name: 'Vazio', random: 0, reactions: 0 },
        { emoji: '💤', name: 'Sono', random: -1, reactions: 0 }
    ];
    const weights = [10, 20, 30, 30, 10];
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[3];

    for (let i = 0; i < prizes.length; i++) {
        cumulative += weights[i];
        if (roll <= cumulative) {
            selectedPrize = prizes[i];
            break;
        }
    }

    usage.used = true;
    imageDb.luckyBoxUsage[userNumber] = usage;
    applyUsagePrize(userNumber, selectedPrize, today);
    await saveDb();

    let msg = `🎁 *CAIXA MISTERIOSA*\n\n`;
    msg += `${selectedPrize.emoji} *${selectedPrize.name}* ${selectedPrize.emoji}\n\n`;
    msg += formatPrizeLines(selectedPrize);
    return msg;
};

export const playScratchCard = async (userNumber) => {
    await loadDb();
    const today = getToday();
    const usage = getDailyUsage(imageDb.scratchUsage, userNumber, today);

    if (usage.used) {
        const { hoursUntilReset, minutesUntilReset } = getTimeUntilReset();
        return `🧾 Você já usou sua *Raspadinha* hoje!\n⏰ Disponível em: ${hoursUntilReset}h ${minutesUntilReset}min`;
    }

    const prizes = [
        { emoji: '🌟', name: 'Raspadinha Dourada', random: 4, reactions: 2 },
        { emoji: '🎊', name: 'Raspadinha Boa', random: 2, reactions: 1 },
        { emoji: '🍀', name: 'Raspadinha OK', random: 1, reactions: 0 },
        { emoji: '😐', name: 'Nada', random: 0, reactions: 0 },
        { emoji: '🪦', name: 'Azar', random: -2, reactions: -1 }
    ];
    const weights = [8, 20, 32, 30, 10];
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[3];

    for (let i = 0; i < prizes.length; i++) {
        cumulative += weights[i];
        if (roll <= cumulative) {
            selectedPrize = prizes[i];
            break;
        }
    }

    usage.used = true;
    imageDb.scratchUsage[userNumber] = usage;
    applyUsagePrize(userNumber, selectedPrize, today);
    await saveDb();

    let msg = `🧾 *RASPADINHA DA SORTE*\n\n`;
    msg += `${selectedPrize.emoji} *${selectedPrize.name}* ${selectedPrize.emoji}\n\n`;
    msg += formatPrizeLines(selectedPrize);
    return msg;
};

export const playTreasureChest = async (userNumber) => {
    await loadDb();
    const today = getToday();
    const usage = getDailyUsage(imageDb.treasureUsage, userNumber, today);

    if (usage.used) {
        const { hoursUntilReset, minutesUntilReset } = getTimeUntilReset();
        return `🧰 Você já abriu seu *Baú do Tesouro* hoje!\n⏰ Disponível em: ${hoursUntilReset}h ${minutesUntilReset}min`;
    }

    const prizes = [
        { emoji: '👑', name: 'Tesouro Lendário', random: 5, reactions: 3 },
        { emoji: '💰', name: 'Tesouro Raro', random: 3, reactions: 2 },
        { emoji: '💵', name: 'Tesouro Comum', random: 2, reactions: 1 },
        { emoji: '🪵', name: 'Baú Vazio', random: 0, reactions: 0 },
        { emoji: '🪤', name: 'Armadilha', random: -2, reactions: -1 }
    ];
    const weights = [5, 15, 35, 35, 10];
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[3];

    for (let i = 0; i < prizes.length; i++) {
        cumulative += weights[i];
        if (roll <= cumulative) {
            selectedPrize = prizes[i];
            break;
        }
    }

    usage.used = true;
    imageDb.treasureUsage[userNumber] = usage;
    applyUsagePrize(userNumber, selectedPrize, today);
    await saveDb();

    let msg = `🧰 *BAÚ DO TESOURO*\n\n`;
    msg += `${selectedPrize.emoji} *${selectedPrize.name}* ${selectedPrize.emoji}\n\n`;
    msg += formatPrizeLines(selectedPrize);
    return msg;
};

export const playSlotMachine = async (userNumber) => {
    await loadDb();
    const today = getToday();
    const usage = getDailyUsage(imageDb.slotUsage, userNumber, today);

    if (usage.used) {
        const { hoursUntilReset, minutesUntilReset } = getTimeUntilReset();
        return `🎰 Você já girou o *Slot* hoje!\n⏰ Disponível em: ${hoursUntilReset}h ${minutesUntilReset}min`;
    }

    const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣', '🍀'];
    const rollSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
    const slots = [rollSymbol(), rollSymbol(), rollSymbol()];
    const [a, b, c] = slots;

    let prize = { emoji: '😐', name: 'Sem prêmio', random: 0, reactions: 0 };
    if (a === b && b === c) {
        prize = { emoji: '💥', name: 'TRIPLO!', random: 3, reactions: 2 };
    } else if (a === b || a === c || b === c) {
        prize = { emoji: '✨', name: 'Dupla!', random: 1, reactions: 1 };
    }

    usage.used = true;
    imageDb.slotUsage[userNumber] = usage;
    applyUsagePrize(userNumber, prize, today);
    await saveDb();

    let msg = `🎰 *SLOT DA SORTE*\n\n`;
    msg += `${slots.join(' | ')}\n\n`;
    msg += `${prize.emoji} *${prize.name}* ${prize.emoji}\n\n`;
    msg += formatPrizeLines(prize);
    return msg;
};

export const playMeteorStorm = async (userNumber) => {
    await loadDb();
    const today = getToday();
    const usage = getDailyUsage(imageDb.meteorUsage, userNumber, today);

    if (usage.used) {
        const { hoursUntilReset, minutesUntilReset } = getTimeUntilReset();
        return `☄️ Você já encarou a *Chuva de Meteoros* hoje!\n⏰ Disponível em: ${hoursUntilReset}h ${minutesUntilReset}min`;
    }

    const prizes = [
        { emoji: '🌠', name: 'Supernova', random: 4, reactions: 2 },
        { emoji: '✨', name: 'Fragmentos', random: 2, reactions: 1 },
        { emoji: '😐', name: 'Céu Nublado', random: 0, reactions: 0 },
        { emoji: '💥', name: 'Impacto', random: -2, reactions: -1 }
    ];
    const weights = [15, 35, 35, 15];
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[2];

    for (let i = 0; i < prizes.length; i++) {
        cumulative += weights[i];
        if (roll <= cumulative) {
            selectedPrize = prizes[i];
            break;
        }
    }

    usage.used = true;
    imageDb.meteorUsage[userNumber] = usage;
    applyUsagePrize(userNumber, selectedPrize, today);
    await saveDb();

    let msg = `☄️ *CHUVA DE METEOROS*\n\n`;
    msg += `${selectedPrize.emoji} *${selectedPrize.name}* ${selectedPrize.emoji}\n\n`;
    msg += formatPrizeLines(selectedPrize);
    return msg;
};

// --- Duel Logic ---

export const startDuel = async (remoteJid, challengerNumber, challengedNumber, challengerChoice) => {
    await loadDb();
    
    // Check if challenger is banned
    if (imageDb.bannedUsers[challengerNumber]) {
        return '🚫 Você está banido e não pode duelar.';
    }
    
    // Check if challenged is banned
    if (imageDb.bannedUsers[challengedNumber]) {
        return '🚫 Este usuário está banido.';
    }
    
    // Can't duel yourself
    if (challengerNumber === challengedNumber) {
        return '❌ Você não pode duelar consigo mesmo!';
    }
    
    // Check if there's already an active duel in this chat
    if (imageDb.activeDuels[remoteJid]) {
        return '⚔️ Já existe um duelo ativo neste grupo! Aguarde ele terminar.';
    }
    
    // Validate choice
    if (challengerChoice !== 'cara' && challengerChoice !== 'coroa') {
        return '❌ Escolha "cara" ou "coroa".\nExemplo: !duel @pessoa cara';
    }
    
    // Create duel
    imageDb.activeDuels[remoteJid] = {
        challenger: challengerNumber,
        challenged: challengedNumber,
        challengerChoice: challengerChoice
    };
    await saveDb();
    
    return null; // Success - duel created
};

export const acceptDuel = async (remoteJid, accepterNumber) => {
    await loadDb();
    
    const duel = imageDb.activeDuels[remoteJid];
    if (!duel) {
        return '❌ Não há duelo ativo neste grupo.';
    }
    
    if (duel.challenged !== accepterNumber) {
        return '❌ Este duelo não é para você!';
    }
    
    // Flip coin
    const result = Math.random() < 0.5 ? 'cara' : 'coroa';
    const challengerWon = result === duel.challengerChoice;
    const winner = challengerWon ? duel.challenger : duel.challenged;
    const loser = challengerWon ? duel.challenged : duel.challenger;
    
    // Transfer 1 reaction
    const today = new Date().toISOString().split('T')[0];
    const loserReaction = imageDb.reactionUsage[loser] || { date: today, count: 0 };
    const winnerReaction = imageDb.reactionUsage[winner] || { date: today, count: 0 };
    
    if (loserReaction.date !== today) {
        loserReaction.date = today;
        loserReaction.count = 0;
    }
    if (winnerReaction.date !== today) {
        winnerReaction.date = today;
        winnerReaction.count = 0;
    }
    
    // Add 1 to loser (reducing available), remove 1 from winner (increasing available)
    loserReaction.count = Math.min(5, loserReaction.count + 1);
    winnerReaction.count = Math.max(0, winnerReaction.count - 1);
    
    imageDb.reactionUsage[loser] = loserReaction;
    imageDb.reactionUsage[winner] = winnerReaction;
    
    // Clear duel
    delete imageDb.activeDuels[remoteJid];
    await saveDb();
    
    const challengerChoiceEmoji = duel.challengerChoice === 'cara' ? '👤' : '👑';
    const resultEmoji = result === 'cara' ? '👤' : '👑';
    
    return {
        challengerWon,
        result,
        challengerChoice: duel.challengerChoice,
        resultEmoji,
        challengerChoiceEmoji
    };
};

// --- Gift Logic ---

export const giftToUser = async (giverNumber, receiverNumber) => {
    await loadDb();
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if giver is banned
    if (imageDb.bannedUsers[giverNumber]) {
        return '🚫 Você está banido e não pode enviar presentes.';
    }
    
    // Check if receiver is banned
    if (imageDb.bannedUsers[receiverNumber]) {
        return '🚫 Este usuário está banido.';
    }
    
    // Can't gift yourself
    if (giverNumber === receiverNumber) {
        return '❌ Você não pode presentear a si mesmo!';
    }
    
    // Check if already gifted today
    const giftUsage = imageDb.giftUsage[giverNumber] || { date: today, used: false };
    
    if (giftUsage.date !== today) {
        giftUsage.date = today;
        giftUsage.used = false;
    }
    
    if (giftUsage.used) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const hoursUntil = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const minutesUntil = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `🎁 Você já enviou um presente hoje!\n⏰ Disponível em: ${hoursUntil}h ${minutesUntil}min`;
    }
    
    // Transfer 1 random use from giver to receiver
    const giverRandom = imageDb.randomUsage[giverNumber] || { date: today, count: 0 };
    const receiverRandom = imageDb.randomUsage[receiverNumber] || { date: today, count: 0 };
    
    if (giverRandom.date !== today) {
        giverRandom.date = today;
        giverRandom.count = 0;
    }
    if (receiverRandom.date !== today) {
        receiverRandom.date = today;
        receiverRandom.count = 0;
    }
    
    // Check if giver has randoms to give
    if (giverRandom.count >= 10) {
        return '❌ Você não tem !random disponíveis para presentear!';
    }
    
    giverRandom.count = Math.min(10, giverRandom.count + 1);
    receiverRandom.count = Math.max(0, receiverRandom.count - 1);
    
    imageDb.randomUsage[giverNumber] = giverRandom;
    imageDb.randomUsage[receiverNumber] = receiverRandom;
    
    giftUsage.used = true;
    imageDb.giftUsage[giverNumber] = giftUsage;
    
    await saveDb();
    
    return null; // Success
};

// --- Ban Logic ---

export const banUser = async (userNumber, reason, duration) => {
    await loadDb();
    
    const until = duration === 'permanent' ? null : Date.now() + (duration * 60 * 60 * 1000);
    
    imageDb.bannedUsers[userNumber] = {
        reason: reason || 'Sem motivo especificado',
        until: until
    };
    
    await saveDb();
    
    if (duration === 'permanent') {
        return `🔨 Usuário banido permanentemente!\nMotivo: ${reason || 'Sem motivo especificado'}`;
    } else {
        return `🔨 Usuário banido por ${duration}h!\nMotivo: ${reason || 'Sem motivo especificado'}`;
    }
};

export const unbanUser = async (userNumber) => {
    await loadDb();
    
    if (!imageDb.bannedUsers[userNumber]) {
        return '❌ Este usuário não está banido.';
    }
    
    delete imageDb.bannedUsers[userNumber];
    await saveDb();
    
    return '✅ Usuário desbanido com sucesso!';
};

export const checkBan = async (userNumber) => {
    await loadDb();
    
    const ban = imageDb.bannedUsers[userNumber];
    if (!ban) return null;
    
    // Check if temporary ban expired
    if (ban.until && ban.until < Date.now()) {
        delete imageDb.bannedUsers[userNumber];
        await saveDb();
        return null;
    }
    
    return ban;
};

// --- Profile Logic ---

export const getUserProfile = async (userNumber) => {
    await loadDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Random usage
    const randomUsage = imageDb.randomUsage[userNumber] || { date: today, count: 0 };
    const randomCount = randomUsage.date === today ? randomUsage.count : 0;
    const randomRemaining = `${10 - randomCount}/10`;
    
    console.log(`📊 Profile for ${userNumber}:`);
    console.log(`  - Random usage:`, randomUsage);
    console.log(`  - Random count today:`, randomCount);
    console.log(`  - Today:`, today);
    
    // Reaction usage
    const reactionUsage = imageDb.reactionUsage[userNumber] || { date: today, count: 0 };
    const reactionCount = reactionUsage.date === today ? reactionUsage.count : 0;
    const reactionRemaining = `${5 - reactionCount}/5`;
    
    // Dice status (check periods)
    const userDice = imageDb.diceUsage[userNumber] || { 
        date: today, 
        morning: false, 
        afternoon: false, 
        night: false 
    };
    
    // Reset if new day
    const diceToday = userDice.date === today;
    const morning = diceToday && userDice.morning;
    const afternoon = diceToday && userDice.afternoon;
    const night = diceToday && userDice.night;
    
    let diceStatus = '';
    diceStatus += morning ? '❌' : '✅';
    diceStatus += ' Manhã | ';
    diceStatus += afternoon ? '❌' : '✅';
    diceStatus += ' Tarde | ';
    diceStatus += night ? '❌' : '✅';
    diceStatus += ' Noite';
    
    // Current period indicator
    let currentPeriod = '';
    if (currentHour < 12) {
        currentPeriod = '🌅 Período atual: Manhã';
    } else if (currentHour < 18) {
        currentPeriod = '☀️ Período atual: Tarde';
    } else {
        currentPeriod = '🌙 Período atual: Noite';
    }
    
    // Time until reset
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
    
    let profile = `👤 *SEU PERFIL*\n\n`;
    profile += `🎲 *Comandos Disponíveis:*\n`;
    profile += `├ !random: ${randomRemaining}\n`;
    profile += `└ Reações: ${reactionRemaining}\n\n`;
    profile += `🎯 *Dados da Sorte:*\n`;
    profile += `${diceStatus}\n`;
    profile += `${currentPeriod}\n`;
    profile += `\n⏰ *Reset em:* ${hoursUntilReset}h ${minutesUntilReset}min`;
    
    return profile;
};

// --- Clear All (Admin only) ---

export const clearAllUsage = async () => {
    await loadDb();
    
    const totalUsers = new Set([
        ...Object.keys(imageDb.randomUsage),
        ...Object.keys(imageDb.reactionUsage),
        ...Object.keys(imageDb.diceUsage)
    ]).size;
    
    imageDb.randomUsage = {};
    imageDb.reactionUsage = {};
    imageDb.diceUsage = {};
    
    await saveDb();
    
    return `🔄 *Reset Completo Executado!*\n\n✅ Resetados ${totalUsers} usuários:\n├ Limites de !random zerados\n├ Limites de reações zerados\n└ Dados liberados (3 períodos)`;
};
