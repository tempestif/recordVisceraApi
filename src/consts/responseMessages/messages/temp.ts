import {
  AccessForbiddenError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";
import {
  ErrorResponseMessageType,
  ResponseMessageType,
} from "@/consts/responseMessages/types";

// 体温
export const RECORD_TEMP: ResponseMessageType = {
  message: "体温を記録しました。",
};

export const READ_TEMP: ResponseMessageType = {
  message: "体温記録のリストを取得しました。",
};

export const ERROR_TEMP_NOT_FOUND: ErrorResponseMessageType = {
  message: "体温が見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_TEMP_ACCESS_FORBIDDEN: ErrorResponseMessageType = {
  message: "この体温記録は編集できません",
  error: (message: string) => new AccessForbiddenError(message),
};

export const EDIT_TEMP: ResponseMessageType = {
  message: "体温記録を編集しました。",
};

export const DELETE_TEMP: ResponseMessageType = {
  message: "体温記録を削除しました。",
};
