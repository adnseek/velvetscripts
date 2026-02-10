module.exports = {
  apps: [
    {
      name: "velvetscripts",
      script: "npm",
      args: "start",
      cwd: "/var/www/velvetscripts",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/www/velvetscripts/logs/error.log",
      out_file: "/var/www/velvetscripts/logs/out.log",
      merge_logs: true,
    },
  ],
};
