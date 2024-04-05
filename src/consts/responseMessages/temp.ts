// 体温
export const RECORD_TEMP = {
  message: "体温を記録しました。",
} as const;

export const READ_TEMP = {
  message: "体温記録のリストを取得しました。",
} as const;

export const ERROR_TEMP_NOT_FOUND = {
  message: "体温が見つかりません。",
} as const;

export const ERROR_TEMP_ACCESS_FORBIDDEN = {
  message: "この体温記録は編集できません",
} as const;

export const EDIT_TEMP = {
  message: "体温記録を編集しました。",
} as const;

export const DELETE_TEMP = {
  message: "体温記録を削除しました。",
} as const;
