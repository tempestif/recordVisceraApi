import { DbRecordNotFoundError } from "@/utils/errorHandle/errors";
import {
  ResponseMessageType,
  ErrorResponseMessageType,
} from "@/consts/responseMessages/types";

// プロフィール
export const COMPLETE_GET_PROFILE: ResponseMessageType = {
  message: "プロフィールを取得しました。",
};

export const ERROR_PROFILE_NOT_FOUND: ErrorResponseMessageType = {
  message: "プロフィールが見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const COMPLETE_UPDATE_PROFILE: ResponseMessageType = {
  message: "プロフィールを更新しました。",
};
