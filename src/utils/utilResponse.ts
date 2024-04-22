import type { Response } from "express";

/**
 * レスポンスの成否、メッセージのみのレスポンスを返却する
 * @param res
 * @param httpStatus HTTPステータス
 * @param status レスポンスの成否
 * @param message レスポンスメッセージ
 * @returns
 */
export const basicHttpResponce = (
  res: Response,
  httpStatus: number,
  status: boolean,
  message: string,
) => {
  return res.status(httpStatus).json({
    status,
    message,
  });
};

export type BasicResponceType = {
  status: boolean;
  message: string;
};

/**
 * データを返す必要のあるレスポンスを作成する
 * @param res
 * @param httpStatus HTTPステータス
 * @param status レスポンスの成否
 * @param message レスポンスメッセージ
 * @param data 返却データ
 * @returns
 */
export const basicHttpResponceIncludeData = (
  res: Response,
  httpStatus: number,
  status: boolean,
  message: string,
  // FIXME: 型が雑
  data: object,
) => {
  return res.status(httpStatus).json({
    status,
    message,
    data,
  });
};
