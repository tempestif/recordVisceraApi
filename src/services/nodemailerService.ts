import { createTransport } from "nodemailer";

/**
 * nodemailerでメールを送信
 * @param to 送信先メールアドレス
 * @param subject 件名
 * @param text 本文
 */
export const sendMail = async (to: string, subject: string, text: string) => {
    // 送信元メールアドレス
    const mail = process.env.MAIL_ACCOUNT;
    // Gmailのアプリパスワード
    const pass = process.env.MAIL_PASSWORD;

    // Gmailにtransportする
    const transporter = createTransport({
        service: "Gmail",
        auth: {
            user: mail,
            pass: pass,
        }
    });

    // メール送信
    await transporter.sendMail({
        from: mail,
        to: to,
        subject: subject,
        text: text,
    });
}