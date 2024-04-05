import {
  ErrorResponseMessageType,
  ResponseMessageType,
} from "@/consts/responseMessages/types";
import {
  AccessForbiddenError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";

export const RECORD_CLINIC: ResponseMessageType = {
  message: "通院記録を記録しました。",
};

export const READ_CLINIC: ResponseMessageType = {
  message: "通院記録のリストを取得しました。",
};

export const ERROR_CLINIC_NOT_FOUND: ErrorResponseMessageType = {
  message: "通院記録が見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_CLINIC_ACCESS_FORBIDDEN: ErrorResponseMessageType = {
  message: "この通院記録記録は編集できません",
  error: (message: string) => new AccessForbiddenError(message),
};

export const EDIT_CLINIC: ResponseMessageType = {
  message: "通院記録記録を編集しました。",
};

export const DELETE_CLINIC: ResponseMessageType = {
  message: "通院記録記録を削除しました。",
};
