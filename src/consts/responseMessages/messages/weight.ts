import {
  AccessForbiddenError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";
import {
  ResponseMessageType,
  ErrorResponseMessageType,
} from "@/consts/responseMessages/types";

// 体重
export const RECORD_WEIGHT: ResponseMessageType = {
  message: "体重を記録しました。",
};

export const READ_WEIGHT: ResponseMessageType = {
  message: "体重記録のリストを取得しました。",
};

export const ERROR_WEIGHT_NOT_FOUND: ErrorResponseMessageType = {
  message: "体重記録が見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_WEIGHT_ACCESS_FORBIDDEN: ErrorResponseMessageType = {
  message: "この体重記録は編集できません",
  error: (message: string) => new AccessForbiddenError(message),
};

export const EDIT_WEIGHT: ResponseMessageType = {
  message: "体重記録を編集しました。",
};

export const DELETE_WEIGHT: ResponseMessageType = {
  message: "体重記録を削除しました。",
};
