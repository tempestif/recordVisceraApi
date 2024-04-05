import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
} from "@/utils/errorHandle/errors";
import {
  ErrorResponseMessageType,
  ResponseMessageType,
} from "@/consts/responseMessages/types";

// ユーザー
export const ERROR_USER_NOT_FOUND: ErrorResponseMessageType = {
  message: "ユーザーが見つかりません。",
  error: (message: string) => new DbRecordNotFoundError(message),
};

export const ERROR_MULTIPLE_ACTIVE_USERS: ErrorResponseMessageType = {
  message: "登録済みユーザーが複数います",
  error: (message: string) => new MultipleActiveUserError(message),
};

// パスワードの更新
export const ERROR_WRONG_OLD_PASSWORD: ErrorResponseMessageType = {
  message: "旧パスワードが間違っています。",
  error: (message: string) => new BadRequestError(message),
};
export const COMPLETE_UPDATE_PASSWORD: ResponseMessageType = {
  message: "パスワードを更新しました。",
};

// ユーザー削除
export const DELETE_USER: ResponseMessageType = {
  message: "ユーザーを削除しました。",
};
