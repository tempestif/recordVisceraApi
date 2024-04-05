// ユーザー
export const ERROR_USER_NOT_FOUND = {
  message: "ユーザーが見つかりません。",
} as const;

export const ERROR_MULTIPLE_ACTIVE_USERS = {
  message: "登録済みユーザーが複数います",
} as const;

// パスワードの更新
export const ERROR_WRONG_OLD_PASSWORD = {
  message: "旧パスワードが間違っています。",
} as const;
export const COMPLETE_UPDATE_PASSWORD = {
  message: "パスワードを更新しました。",
} as const;

// ユーザー削除
export const DELETE_USER = {
  message: "ユーザーを削除しました。",
} as const;
