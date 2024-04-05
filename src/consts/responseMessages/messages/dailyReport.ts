import {
  ResponseMessageType,
  ErrorResponseMessageType,
} from "@/consts/responseMessages/types";
import {
  AccessForbiddenError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";

export const RECORD_DAILY_REPORT: ResponseMessageType = {
  message: "今日の体調を記録しました。",
};

export const READ_DAILY_REPORT: ResponseMessageType = {
  message: "今日の体調記録のリストを取得しました。",
};

export const ERROR_DAILY_REPORT_NOT_FOUND: ErrorResponseMessageType = {
  message: "今日の体調が見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_DAILY_REPORT_ACCESS_FORBIDDEN: ErrorResponseMessageType = {
  message: "この今日の体調記録は編集できません",
  error: (message: string) => new AccessForbiddenError(message),
};

export const EDIT_DAILY_REPORT: ResponseMessageType = {
  message: "今日の体調記録を編集しました。",
};

export const DELETE_DAILY_REPORT: ResponseMessageType = {
  message: "今日の体調記録を削除しました。",
};
