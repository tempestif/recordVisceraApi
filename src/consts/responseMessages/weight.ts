// 体重
export const RECORD_WEIGHT = {
  message: "体重を記録しました。",
} as const;

export const READ_WEIGHT = {
  message: "体重記録のリストを取得しました。",
} as const;

export const ERROR_WEIGHT_NOT_FOUND = {
  message: "体重記録が見つかりません。",
} as const;

export const ERROR_WEIGHT_ACCESS_FORBIDDEN = {
  message: "この体重記録は編集できません",
} as const;

export const EDIT_WEIGHT = {
  message: "体重記録を編集しました。",
} as const;

export const DELETE_WEIGHT = {
  message: "体重記録を削除しました。",
} as const;
