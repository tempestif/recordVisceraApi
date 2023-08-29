import { NOT_FOUND_USER, RECORD_TEMP } from "@/consts/responseConsts";
import { offsetTimePrisma } from "@/services/prismaMiddleware";
import { internalServerErr } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
/**
 * 体温を記録
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, temp, date
 * @param res
 * @param next
 * @returns
 */
export const registTemp = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, temp, date } = req.body
    // TODO: バリデーション

    try {
        // userIdで検索
        const whereByUserId = { id: userId }

        // ユーザー検索
        const user = await offsetTimePrisma.user.findUnique({ where: whereByUserId })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            return res.status(401).json({
                "status": false,
                "message": NOT_FOUND_USER.message,
            })
        }

        // dateが無かったら現在日時を入力
        let dateForDb = date
        if (!date) {
            dateForDb = new Date()
        }

        // 体温を追加
        const tempData = await offsetTimePrisma.user_Temp.create({
            data: {
                userId,
                date: dateForDb,
                temp
            }
        })

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": RECORD_TEMP.message,
            "data": tempData
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}

/**
 * 体温を参照
 * TODO: ソート、フィルタをつける。req.queryで。
 * @param req
 * @param res
 * @param next
 */
export const readTemp = async (req: Request, res: Response, next: NextFunction) => {
}