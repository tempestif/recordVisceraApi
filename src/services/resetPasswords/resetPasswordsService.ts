import {
  TITLE_VALID_RESET_PASS,
  TEXT_VALID_RESET_PASS,
} from "@/consts/mailConsts";
import { sendMail } from "@/utils/nodemailer";

/**
 * email認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
export const sendMailForResetPasswordVerify = async (
  email: string,
  url: string
) => {
  // 件名
  const mailSubject = TITLE_VALID_RESET_PASS.message;
  // 本文
  const text = TEXT_VALID_RESET_PASS.message(url);
  await sendMail(email, mailSubject, text);
};
