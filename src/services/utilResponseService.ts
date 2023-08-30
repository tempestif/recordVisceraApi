import type { Response } from "express"
/**
 * 500エラー
 */
export const internalServerErr = (res: Response, e: any) => {
    // エラーの時のレスポンス
    return res.status(500).json({
        "status": false,
        "message": e, // TODO: 本番環境では固定文言に変更
    });
}

/**
 * レスポンスの成否、メッセージのみのレスポンスを返却する
 * @param res
 * @param HttpStatus
 * @param status レスポンスの成否
 * @param message
 * @returns
 */
export const basicResponce = (res: Response, HttpStatus: number, status: boolean, message: string) => {
    return res.status(HttpStatus).json({
        status,
        message
    })
}