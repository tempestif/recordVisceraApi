import { TITLE_VALID_MAIL, TEXT_VALID_MAIL } from "@/consts/mailConsts";
import { sendMail } from "@/utils/nodemailer";

/**
 * email認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
export const sendMailForEmailVerify = async (email: string, url: string) => {
  // 件名
  const mailSubject = TITLE_VALID_MAIL.message;
  // 本文
  const text = TEXT_VALID_MAIL.message(url);
  await sendMail(email, mailSubject, text);
};
