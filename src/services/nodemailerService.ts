import { createTransport } from "nodemailer";

export const sendMail = async (to: string, subject: string, text: string) => {
    const mail = process.env.MAIL_ACCOUNT;
    const pass = process.env.MAIL_PASSWORD;

    const transporter = createTransport({
        service: "Gmail",
        auth: {
            user: mail,
            pass: pass,
        }
    });

    const info = await transporter.sendMail({
        from: mail,
        to: to,
        subject: subject,
        text: text,
    });

    console.log("Message sent: %s", info.response);
    console.log("finish");
}