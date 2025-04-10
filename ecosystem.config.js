module.exports = {
    apps: [{
        name: "whatsapp-bot",
        script: "src/index.js",
        watch: false,
        max_memory_restart: "1G",
        env: {
            NODE_ENV: "production",
        },
        error_file: "logs/err.log",
        out_file: "logs/out.log",
        log_file: "logs/combined.log",
        time: true,
        restart_delay: 4000,
        exp_backoff_restart_delay: 100,
        max_restarts: 10,
        wait_ready: true,
        kill_timeout: 3000
    }]
};
