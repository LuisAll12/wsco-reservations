import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendVerificationEmail = async (email: string, recipientName: string, code: string, time: string = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })) => {
    const mailOptions = {
        from: {
            name: "WSCO",
            address: process.env.SMTP_USER,
        },
        to: email,
        subject: "Dein WSCO-Reservierungscode",
        html: `
            <div style="font-family: system-ui, sans-serif, Arial; font-size: 14px;  text-align: center;">
                <h1 style="color: #0466c8; font-size: 24px; font-weight: 600">Welcome to WSCO!</h1>
                <p>Ahoi ${recipientName}</p>
                <p style="padding-bottom: 14px; border-bottom: 1px solid #eaeaea">
                    To authenticate, please use the following One Time Password (OTP):
                </p>
                <p style="font-size: 22px; color: #0466c8"><strong>${code}</strong></p>
                <p style="border-top: 1px solid #eaeaea; padding-top: 14px">This OTP will be valid for 15 minutes till
                    <strong>${time}</strong>.
                </p>
                <p>
                    Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this
                    email.<br />WSCO will never contact you about this email or ask for any login codes or
                    links. Beware of phishing scams.
                </p>
                <p>Thanks for visiting WSCO!</p>
            </div>       
        `,
    };



    try {
        await transporter.sendMail(mailOptions as unknown as nodemailer.SendMailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}