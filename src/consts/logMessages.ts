// ユーザーIDがなかった際のログに残すメッセージ
// 型定義の都合上2つに分かれている。変更するなら両方変更する必要がある。
export const UNSPECIFIED_USER_ID = {
  message: "unspecified",
} as const;
export type UNSPECIFIED_USER_ID_TYPE = "unspecified";

export const PROCESS_SUCCESS = {
  message: (funcName: string) => `${funcName} success`,
} as const;

export const PROCESS_FAILURE = {
  message: (funcName: string) => `${funcName} failure`,
} as const;

export const UNEXPECTED_ERROR = {
  message: "unexpected error",
} as const;
