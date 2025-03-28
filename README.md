# Chatbot WhatsApp

Este é um chatbot simples para WhatsApp desenvolvido em JavaScript usando as bibliotecas whatsapp-web.js e qrcode-terminal.

## Estrutura do Projeto

```
.
├── src/
│   ├── config/
│   │   └── client.js      # Configuração do cliente WhatsApp
│   └── commands/
│       ├── index.js       # Gerenciador de comandos
│       ├── sticker.js     # Comando de sticker
│       ├── help.js        # Comando de ajuda
│       ├── ping.js        # Comando de ping
│       └── ola.js         # Comando de saudação
├── index.js               # Arquivo principal
├── package.json          # Dependências do projeto
└── README.md            # Este arquivo
```

## Requisitos

- Node.js 14 ou superior
- NPM (Node Package Manager)
- Conta WhatsApp

## Instalação

1. Clone este repositório
2. Instale as dependências:
```bash
npm install
```

## Como usar

1. Execute o bot:
```bash
npm start
```

2. Escaneie o código QR que aparecerá no terminal com seu WhatsApp

## Funcionalidades

- Leitura de mensagens recebidas
- Resposta automática a comandos
- Processamento de comandos básicos
- Conversão de imagens em stickers

## Comandos disponíveis

- `!ola` - Recebe uma saudação do bot
- `!ajuda` - Mostra os comandos disponíveis
- `!ping` - Verifica se o bot está online
- `!sticker` - Converte uma imagem em sticker (envie a imagem junto com o comando)

## Como usar o comando de sticker

1. Envie uma imagem para o bot
2. Adicione o comando `!sticker` na legenda da imagem
3. O bot irá processar a imagem e enviar de volta como sticker

## Observações

- O bot precisa ser inicializado manualmente após cada reinicialização do computador
- A primeira vez que você executar o bot, será necessário escanear o QR Code
- As sessões subsequentes serão restauradas automaticamente
- Para criar stickers, envie apenas imagens (JPG, PNG, etc.)
- O bot redimensionará automaticamente a imagem para o tamanho adequado para stickers

## Desenvolvimento

Para adicionar novos comandos:

1. Crie um novo arquivo na pasta `src/commands/`
2. Exporte a função do comando
3. Adicione o comando no objeto `commands` em `src/commands/index.js`
