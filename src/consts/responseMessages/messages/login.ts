import {
  TokenForbiddenError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import {
  ResponseMessageType,
  ErrorResponseMessageType,
} from "@/consts/responseMessages/types";

// ログイン
export const WRONG_LOGIN_INFO: ResponseMessageType = {
  message: "メールアドレス、またはパスワードが違います。",
};

export const COMPLETE_LOGIN: ResponseMessageType = {
  message: "ログインが完了しました。",
};

export const COMPLETE_LOGOUT: ResponseMessageType = {
  message: "ログアウトが完了しました。",
};

export const ERROR_TOKEN_NOT_FOUND: ErrorResponseMessageType = {
  message: "トークンが見つかりません。",
  error: (message: string) => new TokenNotFoundError(message),
};

export const ERROR_TOKEN_NOT_DISCREPANCY: ErrorResponseMessageType = {
  message: "トークンが一致しません。",
  error: (message: string) => new TokenForbiddenError(message),
};

export const USER_LOGOUT: ResponseMessageType = {
  message: "ログアウト状態です。",
};

export const USER_DEACTIVED: ResponseMessageType = {
  message: "退会状態です。",
};
