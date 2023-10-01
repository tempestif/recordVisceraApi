import type { Request, Response, NextFunction } from "express";

/**
 * パスワード再設定のリクエストを行う
 * トークンを生成してurlをメール送信する。
 * @param req
 * @param res
 * @param next
 */
export const requestResettingPassword = async (req: Request, res: Response, next: NextFunction) => {}

/**
 * パスワード再設定を実行する
 * paramのid, tokenを用いて認証、bodyの新パスワードに更新
 * @param req
 * @param res
 * @param next
 */
export const ExecuteResettingPassword = async (req: Request, res: Response, next: NextFunction) => {}