import brasileiraoCommand from './brasileirao.js';
import caraoucoroaCommand from './caraoucoroa.js';
import chatCommand from './chat.js';
import dadoCommand from './dado.js';
import everyoneCommand from './everyone.js';
import gatoCommand from './gato.js';
import helpCommand from './help.js';
import libertadoresCommand from './libertadores.js';
import pptCommand from './pedrapapeltesoura.js';
import pingCommand from './ping.js';
import rankValorantCommand from './rankValorant.js';
import stickerCommand from './sticker.js';
import sulamericanaCommand from './sulamericana.js';
import smurfdomucaCommand from './smurfdomuca.js';
import tabelaBrasileiraoCommand from './tabelaBrasileirao.js';
import tabelaLibertadoresCommand from './tabelaLibertadores.js';
import vctamericasCommand from './vctamericas.js';
import makeCommand from './make.js';
import vlrCommand from './vlr.js';
import cronCommand from './cron.js';
import registerImageCommand from './registerImage.js';
import randomImageCommand from './randomImage.js';
import imageRankCommand from './imageRank.js';
import diceResetCommand from './diceReset.js';
import profileCommand from './profile.js';
import clearCommand from './clear.js';
import rouletteCommand from './roulette.js';
import duelCommand from './duel.js';
import giftCommand from './gift.js';
import banCommand from './ban.js';
import caixaCommand from './caixa.js';
import raspadinhaCommand from './raspadinha.js';
import tesouroCommand from './tesouro.js';
import slotCommand from './slot.js';
import meteoroCommand from './meteoro.js';
import cartaCommand from './carta.js';
import parimparCommand from './parimpar.js';
import dueldadoCommand from './dueldado.js';
import jokenpoCommand from './jokenpo.js';
import admCommand from './adm.js';
import { getCustomCommand } from '../services/customCommandService.js';
import { checkBan } from '../services/imageRankService.js';

const commands = {
    'ajuda': helpCommand,
    'help': helpCommand,
    'ping': pingCommand,
    'chat': chatCommand,
    'everyone': everyoneCommand,
    'rank': rankValorantCommand,
    'sticker': stickerCommand,
    'dado': dadoCommand,
    'caraoucoroa': caraoucoroaCommand,
    'ppt': pptCommand,
    'gato': gatoCommand,
    'libertadores': libertadoresCommand,
    'sulamericana': sulamericanaCommand,
    'smurfdomuca': smurfdomucaCommand,
    'brasileirao': brasileiraoCommand,
    'tabelabrasileirao': tabelaBrasileiraoCommand,
    'tabelalibertadores': tabelaLibertadoresCommand,
    'vctamericas': vctamericasCommand,
    'make': makeCommand,
    'vlr': vlrCommand,
    'cron': cronCommand,
    'register': registerImageCommand,
    'random': randomImageCommand,
    'carta': cartaCommand,
    'adm': admCommand,
    'imgrank': imageRankCommand,
    'dice': diceResetCommand,
    'profile': profileCommand,
    'me': profileCommand,
    'clear': clearCommand,
    'roulette': rouletteCommand,
    'roleta': rouletteCommand,
    'duel': duelCommand,
    'duelo': duelCommand,
    'parimpar': parimparCommand,
    'dueldado': dueldadoCommand,
    'jokenpo': jokenpoCommand,
    'gift': giftCommand,
    'presente': giftCommand,
    'ban': banCommand,
    'caixa': caixaCommand,
    'raspadinha': raspadinhaCommand,
    'tesouro': tesouroCommand,
    'slot': slotCommand,
    'meteoro': meteoroCommand
};

const handleCommand = async (message, command, instance) => {
    const normalizedCommand = (command || '').trim();
    const parts = normalizedCommand ? normalizedCommand.split(/\s+/) : [];
    const commandName = parts[0];
    const args = parts.slice(1);
    const commandHandler = commands[commandName];

    if (!commandName) {
        return;
    }

    // Check if user is banned (except for ban command itself)
    if (commandName !== 'ban') {
        const userNumber = message.key.participant?.replace('@lid', '').replace('@s.whatsapp.net', '') || 
                          message.key.remoteJid?.replace('@s.whatsapp.net', '');
        
        const ban = await checkBan(userNumber);
        if (ban) {
            const { sendReply } = await import('../services/evolutionApi.js');
            
            let banMsg = '🚫 *VOCÊ ESTÁ BANIDO* 🚫\n\n';
            banMsg += `📋 Motivo: ${ban.reason}\n`;
            
            if (ban.until) {
                const now = Date.now();
                const remaining = ban.until - now;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                banMsg += `⏰ Expira em: ${hours}h ${minutes}min`;
            } else {
                banMsg += `⚠️ Ban permanente`;
            }
            
            await sendReply(instance, message.key.remoteJid, banMsg, message.key.id);
            return;
        }
    }

    // Se tiver handler nativo, executa
    if (commandHandler) {
        try {
            await commandHandler(message, instance, args);
        } catch (error) {
            console.error('Erro ao processar comando:', error);
            const { sendReply } = await import('../services/evolutionApi.js');
            await sendReply(
                instance,
                message.key.remoteJid,
                'Ocorreu um erro ao processar o comando. Tente novamente mais tarde.',
                message.key.id
            );
        }
        return;
    }

    // Se não tiver nativo, procura nos customizados
    try {
        const customData = await getCustomCommand(commandName);
        if (customData) {
            const { sendReply, sendSticker } = await import('../services/evolutionApi.js');
            
            if (typeof customData === 'string') {
                // Legado (apenas texto)
                await sendReply(instance, message.key.remoteJid, customData, message.key.id);
            } else if (customData.type === 'sticker') {
                // Sticker
                await sendSticker(instance, message.key.remoteJid, customData.content);
            } else {
                // Texto (objeto novo)
                await sendReply(instance, message.key.remoteJid, customData.content, message.key.id);
            }
            return;
        }
    } catch (error) {
        console.error('Erro ao buscar custom command:', error);
    }

    // Se não achou nada
    const { sendReply } = await import('../services/evolutionApi.js');
    await sendReply(
        instance,
        message.key.remoteJid,
        'Comando inválido. Digite !ajuda para ver os comandos disponíveis.',
        message.key.id
    );
};

export default handleCommand;
