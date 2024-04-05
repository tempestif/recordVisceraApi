import {
  ErrorResponseMessageType,
  ResponseMessageType,
} from "@/consts/responseMessages/types";
import {
  AccessForbiddenError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";

export const RECORD_BOWEL_MOVEMENT: ResponseMessageType = {
  message: "排便記録を記録しました。",
};

export const READ_BOWEL_MOVEMENT: ResponseMessageType = {
  message: "排便記録のリストを取得しました。",
};

export const ERROR_BOWEL_MOVEMENT_NOT_FOUND: ErrorResponseMessageType = {
  message: "排便記録が見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_BOWEL_MOVEMENT_ACCESS_FORBIDDEN: ErrorResponseMessageType = {
  message: "この排便記録は編集できません",
  error: (message: string) => new AccessForbiddenError(message),
};

export const EDIT_BOWEL_MOVEMENT: ResponseMessageType = {
  message: "排便記録を編集しました。",
};

export const DELETE_BOWEL_MOVEMENT: ResponseMessageType = {
  message: "排便記録を削除しました。",
};

export const COUNT_BOWEL_MOVEMENT_PER_DAY: ResponseMessageType = {
  message: "排便回数/日を集計しました。",
};
