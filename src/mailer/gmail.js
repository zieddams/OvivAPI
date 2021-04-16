const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(process.env.EMAIL_CLIENT_ID, process.env.EMAIL_CLIENT_SECRET, process.env.REDIRECT_URI)
oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
})

module.exports.sendGmail = async (to, subject, text, html) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'ovivchat@gmail.com',
                clientId: process.env.EMAIL_CLIENT_ID,
                clientSecret: process.env.EMAIL_CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken
            }
        })
        const mailOptions = {
            from: 'OVIV <ovivchat@gmail.com>',
            to,
            subject,
            text,
            html
        }
        const result = await transport.sendMail(mailOptions)
        return result;
    } catch (error) {
        return error
    }
}