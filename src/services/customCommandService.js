import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendReply, downloadMedia } from './evolutionApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/customCommands.json');

// Cache em memória para evitar ler disco toda hora
let commandsCache = null;

// Controle de estado: quem está criando comando
// Formato: { 'remoteJid': 'nomeDoComandoSendoCriado' }
const activeCreations = {};

/**
 * Carrega os comandos do arquivo JSON
 */
const loadCommands = async () => {
    if (commandsCache) return commandsCache;

    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        commandsCache = JSON.parse(data);
    } catch (error) {
        // Se arquivo não existe, cria vazio
        commandsCache = {};
        await saveCommandsToDisk();
    }
    return commandsCache;
};

/**
 * Salva os comandos no disco
 */
const saveCommandsToDisk = async () => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(commandsCache, null, 2));
    } catch (error) {
        console.error('Erro ao salvar comandos:', error);
    }
};

/**
 * Inicia o processo de criação de um comando
 */
export const startCreation = (remoteJid, commandName) => {
    activeCreations[remoteJid] = commandName.toLowerCase();
};

/**
 * Verifica se o usuário está criando um comando e processa o conteúdo
 */
export const handleCreationStep = async (instance, remoteJid, message, messageId) => {
    const commandName = activeCreations[remoteJid];
    
    if (!commandName) return false; // Não está criando nada

    try {
        // Carrega comandos existentes
        await loadCommands();

        const isSticker = message.message?.stickerMessage;
        let commandData;

        if (isSticker) {
            // Processa Sticker
            try {
                const mediaData = await downloadMedia(instance, message);
                if (!mediaData || !mediaData.base64) {
                    throw new Error('Falha ao baixar sticker');
                }
                const mime = mediaData.mimetype || 'image/webp';
                commandData = {
                    type: 'sticker',
                    content: `data:${mime};base64,${mediaData.base64}` // Salva como Data URI
                };
            } catch (err) {
                console.error('Erro ao baixar sticker para custom command:', err);
                await sendReply(instance, remoteJid, '❌ Erro ao salvar o sticker. Tente novamente.', messageId);
                return true; // Mantém no fluxo ou sai? Retornar true consome a mensagem.
            }
        } else {
            // Processa Texto
            const textContent = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || '';
            
            if (!textContent) {
                await sendReply(instance, remoteJid, '❌ Conteúdo inválido. Envie texto ou um sticker.', messageId);
                return true;
            }

            commandData = {
                type: 'text',
                content: textContent
            };
        }

        // Salva o novo comando (sobrescreve se existir)
        commandsCache[commandName] = commandData;
        await saveCommandsToDisk();

        // Limpa o estado
        delete activeCreations[remoteJid];

        await sendReply(
            instance,
            remoteJid,
            `✅ Comando *!${commandName}* criado/atualizado com sucesso!`,
            messageId
        );
        return true; // Processado com sucesso
    } catch (error) {
        console.error('Erro ao salvar custom command:', error);
        return false;
    }
};

/**
 * Busca o conteúdo de um comando personalizado
 */
export const getCustomCommand = async (commandName) => {
    await loadCommands();
    return commandsCache[commandName.toLowerCase()];
};

/**
 * Lista todos os comandos personalizados
 */
export const listCustomCommands = async () => {
    await loadCommands();
    return Object.keys(commandsCache);
};
