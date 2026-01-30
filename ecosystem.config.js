module.exports = {
  apps: [{
    name: "whatsapp-bot",
    script: "./src/index.js",
    watch: true,
    ignore_watch: ["node_modules", "src/data"],
    env: {
      NODE_ENV: "production",
    }
  }]
}