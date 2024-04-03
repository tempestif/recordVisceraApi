import {
  TEXT_VALID_RESET_PASS,
  TITLE_VALID_RESET_PASS,
} from "@/consts/mailConsts";
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

  if (!mail || !pass) {
    throw new Error("sendMail: 環境変数が足りません");
  }

  // Gmailにtransportする
  const transporter = createTransport({
    service: "Gmail",
    auth: {
      user: mail,
      pass,
    },
  });

  // メール送信
  await transporter.sendMail({
    from: mail,
    to,
    subject,
    text,
  });
};
