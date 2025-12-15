import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create transporter for Gmail SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Message object
    const message = {
        from: process.env.EMAIL_FROM || `PharmacyFinder <noreply@pharmacyfinder.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Support HTML emails
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
