module.exports = {
    apps: [{
        name: "whatsapp-bot",
        script: "src/index.js",
        max_memory_restart: "2G",
        env: {
            NODE_ENV: "production",
        },
        error_file: "logs/err.log",
        out_file: "logs/out.log",
        log_file: "logs/combined.log",
        time: true,
        exp_backoff_restart_delay: 100,
        max_restarts: 10,
        wait_ready: true,
        kill_timeout: 3000,
        restart_delay: 4000,
        watch: false,
        ignore_watch: ["node_modules", "logs", ".git"],
        env_production: {
            NODE_ENV: "production"
        }
    }]
};
