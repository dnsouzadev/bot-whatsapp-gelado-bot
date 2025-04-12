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
import rankCommand from './rank.js';
import stickerCommand from './sticker.js';
import sulamericanaCommand from './sulamericana.js';
import tabelaBrasileiraoCommand from './tabelaBrasileirao.js';
import tabelaLibertadoresCommand from './tabelaLibertadores.js';
import vctamericasCommand from './vctamericas.js';

const commands = {
    'ajuda': helpCommand,
    'help': helpCommand,
    'ping': pingCommand,
    'chat': chatCommand,
    'everyone': everyoneCommand,
    'sticker': stickerCommand,
    'rank': rankCommand,
    'dado': dadoCommand,
    'caraoucoroa': caraoucoroaCommand,
    'ppt': pptCommand,
    'gato': gatoCommand,
    'libertadores': libertadoresCommand,
    'sulamericana': sulamericanaCommand,
    'brasileirao': brasileiraoCommand,
    'tabelabrasileirao': tabelaBrasileiraoCommand,
    'tabelalibertadores': tabelaLibertadoresCommand,
    'vctamericas': vctamericasCommand
};

export default commands;
