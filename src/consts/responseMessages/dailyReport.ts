export const RECORD_DAILY_REPORT = {
  message: "今日の体調を記録しました。",
} as const;

export const READ_DAILY_REPORT = {
  message: "今日の体調記録のリストを取得しました。",
} as const;

export const ERROR_DAILY_REPORT_NOT_FOUND = {
  message: "今日の体調が見つかりません。",
} as const;

export const ERROR_DAILY_REPORT_ACCESS_FORBIDDEN = {
  message: "この今日の体調記録は編集できません",
} as const;

export const EDIT_DAILY_REPORT = {
  message: "今日の体調記録を編集しました。",
} as const;

export const DELETE_DAILY_REPORT = {
  message: "今日の体調記録を削除しました。",
} as const;
