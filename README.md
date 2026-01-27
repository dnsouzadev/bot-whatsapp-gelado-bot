# 🤖 Bot de WhatsApp - Evolution API

Bot de WhatsApp refatorado para usar Evolution API com suporte apenas para grupos.

## 🚀 Funcionalidades

### ⚽ Futebol
- `!libertadores` - Jogos ao vivo da Libertadores
- `!sulamericana` - Jogos ao vivo da Sul-Americana
- `!brasileirao` - Jogos ao vivo do Brasileirão
- `!tabelabrasileirao` - Tabela do Brasileirão
- `!tabelalibertadores` - Tabela da Libertadores

### 🎮 Valorant
- `!rank [nome#tag]` - Rank de um jogador
- `!vctamericas` - Informações do VCT Americas

### 🎲 Jogos
- `!dado` - Rola um dado (1-6)
- `!caraoucoroa` - Cara ou coroa
- `!ppt [pedra/papel/tesoura]` - Pedra, papel ou tesoura

### 😄 Diversão
- `!gato` - Foto aleatória de gato
- `!chat [mensagem]` - Conversa com IA

### 📱 Outros
- `!sticker` - Converte imagem em sticker
- `!everyone` - Marca todos do grupo
- `!ping` - Verifica se o bot está online
- `!ajuda` - Mostra a mensagem de ajuda

## ⚙️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais
4. Configure o webhook na Evolution API para: `http://seu-ip:9105/webhook`
5. Inicie o bot:
```bash
npm run dev
```

## 🔧 Configuração

Renomeie `.env.example` para `.env` e preencha com suas credenciais.

## 📝 Observações

- O bot funciona **apenas em grupos**
- Mensagens privadas são ignoradas
- Certifique-se de que a instância da Evolution API está ativa

## 🛠️ Tecnologias

- Node.js
- Express
- Evolution API
- Google Gemini AI
- Axios
