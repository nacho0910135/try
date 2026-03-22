module.exports = {
  apps: [
    {
      name: "bienesraicescr-backend",
      cwd: "./backend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production"
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      time: true
    },
    {
      name: "bienesraicescr-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      time: true
    }
  ]
};
