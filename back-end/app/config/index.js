require('dotenv').config();

const config = {
    app: {
        port: process.env.APP_PORT,
    },
    db: {
        uri: process.env.MONGODB_URI,
    },
    email: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
    },
    viteApp:{
        port: process.env.VITE_APP_API_PORT,
        url: process.env.VITE_APP_API_URL,
        // viteURL: `${process.env.VITE_APP_API_URL}:${process.env.VITE_APP_API_PORT}`,
    }
};

module.exports = config;
