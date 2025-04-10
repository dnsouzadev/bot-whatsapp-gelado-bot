# 🤖 Bot de WhatsApp

Um bot de WhatsApp multifuncional com diversos comandos para entretenimento, futebol, jogos e mais!

## 🚀 Funcionalidades

### ⚽ Futebol
- `!libertadores` - Mostra os jogos ao vivo da Libertadores
- `!sulamericana` - Mostra os jogos ao vivo da Sul-Americana
- `!brasileirao` - Mostra os jogos ao vivo do Brasileirão
- `!tabelabrasileirao` - Mostra a tabela do Brasileirão
- `!tabelalibertadores` - Mostra a tabela da Libertadores

### 🎮 Valorant
- `!rank [nome#tag]` - Mostra o rank de um jogador do Valorant

### 🎲 Jogos
- `!dado` - Rola um dado de 1 a 6
- `!caraoucoroa` - Joga cara ou coroa
- `!ppt [pedra/papel/tesoura]` - Joga pedra, papel ou tesoura contra o bot

### 😄 Diversão
- `!gato` - Mostra uma foto aleatória de um gato

### 📱 Outros
- `!sticker` - Converte uma imagem em sticker
- `!everyone` - Marca todos os membros do grupo
- `!chat` - Inicia uma conversa com o bot
- `!ping` - Verifica se o bot está online
- `!ajuda` - Mostra esta mensagem de ajuda

## 🛠️ Tecnologias Utilizadas

- Node.js
- WhatsApp Web JS
- OpenAI API
- Axios
- Sharp
- PM2 (para produção)

## ⚙️ Configuração

1. Clone o repositório:
```bash
git clone [seu-repositorio]
cd chatbot-whatsapp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```
OPENAI_API_KEY=sua_chave_api
```

## 🚀 Executando o Bot

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run prod
```

### Comandos PM2
```bash
# Ver status
npm run status

# Ver logs
npm run logs

# Reiniciar
npm run restart

# Parar
npm run stop
```

## 📦 Deploy na AWS

1. Crie uma instância EC2 (recomendado: t2.micro)
2. Use Ubuntu Server 22.04 LTS
3. Configure o security group para permitir SSH (porta 22)

### Comandos para configurar a AWS:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo apt install git

# Clonar e configurar o projeto
git clone [seu-repositorio]
cd chatbot-whatsapp
npm install
npm run prod

# Configurar para iniciar automaticamente
pm2 save
pm2 startup
```

## 📝 Logs

Os logs são armazenados na pasta `logs/`:
- `err.log` - Logs de erro
- `out.log` - Logs de saída
- `combined.log` - Logs combinados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- [WhatsApp Web JS](https://github.com/pedroslopez/whatsapp-web.js)
- [OpenAI](https://openai.com)
- [Sportradar API](https://developer.sportradar.com)
- [The Cat API](https://thecatapi.com)
