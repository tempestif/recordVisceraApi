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