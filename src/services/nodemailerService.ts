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

/**
 * email認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
export const sendMailForResetPasswordVerify = async (
  email: string,
  url: string,
) => {
  // 件名
  const mailSubject = TITLE_VALID_RESET_PASS.message;
  // 本文
  const text = TEXT_VALID_RESET_PASS.message(url);
  await sendMail(email, mailSubject, text);
};
