const nodemailer = require('nodemailer');
module.exports= nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 25,
    auth: {
       user: 'f7db72a4cafbba',
       pass: '8b72aec2134d6f'
    }
});
