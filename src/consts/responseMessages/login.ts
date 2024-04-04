// ログイン
export const WRONG_LOGIN_INFO = {
  message: "メールアドレス、またはパスワードが違います。",
} as const;

export const COMPLETE_LOGIN = {
  message: "ログインが完了しました。",
} as const;

export const COMPLETE_LOOUT = {
  message: "ログアウトが完了しました。",
} as const;

export const TOKEN_NOT_FOUND = {
  message: "トークンが見つかりません。",
} as const;

export const TOKEN_NOT_DISCREPANCY = {
  message: "トークンが一致しません。",
} as const;

export const USER_LOGOUT = {
  message: "ログアウト状態です。",
} as const;

export const USER_DEACTIVED = {
  message: "退会状態です。",
} as const;
