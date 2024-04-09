import type { Response } from "express";
/**
 * 500エラー
 */
export const internalServerError = (res: Response, e: any) => {
  // エラーの時のレスポンス
  return res.status(500).json({
    status: false,
    message: e, // TODO: 本番環境では固定文言に変更
  });
};

/**
 * レスポンスの成否、メッセージのみのレスポンスを返却する
 * @param res
 * @param HttpStatus HTTPステータス
 * @param status レスポンスの成否
 * @param message レスポンスメッセージ
 * @returns
 */
export const basicHttpResponce = (
  res: Response,
  HttpStatus: number,
  status: boolean,
  message: string
) => {
  return res.status(HttpStatus).json({
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
 * @param HttpStatus HTTPステータス
 * @param status レスポンスの成否
 * @param message レスポンスメッセージ
 * @param data 返却データ
 * @returns
 */
export const basicHttpResponceIncludeData = (
  res: Response,
  HttpStatus: number,
  status: boolean,
  message: string,
  data: object
) => {
  return res.status(HttpStatus).json({
    status,
    message,
    data,
  });
};
