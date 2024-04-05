import { BadRequestError } from "@/utils/errorHandle/errors";
import {
  ErrorResponseMessageType,
  ResponseMessageType,
} from "@/consts/responseMessages/types";

// メール
export const ERROR_ALREADY_USED_MAILADDLESS: ErrorResponseMessageType = {
  message: "すでにそのメールアドレスは使用されています。",
  error: (message: string) => new BadRequestError(message),
};

export const SEND_MAIL_FOR_USER_VALID: ResponseMessageType = {
  message: "ユーザー認証のためのメールが送信されました。",
};

export const SEND_MAIL_FOR_RESET_PASS_VALID: ResponseMessageType = {
  message: "パスワードリセットのためのメールが送信されました。",
};

export const COMPLETE_VALID_MAILADDRESS: ResponseMessageType = {
  message: "メールアドレスの認証が完了しました。",
};

export const COMPLETE_VALID_RESET_PASS: ResponseMessageType = {
  message: "パスワードのリセットが完了しました。",
};
