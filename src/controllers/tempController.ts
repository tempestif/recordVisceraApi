import { DEFAULT_DATA_INFO } from "@/consts/db";
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

// クエリの型を整理するため。
type Query = {
    sort: string | undefined
    fields: string | undefined
    limit: string | undefined
    offset: string | undefined
}

/**
 * 体温のリストを取得
 * クエリで条件を指定
 * sort: 表示順 指定が早い順にandで並び変える
 * fields: 返却されるフィールド 指定されたフィールドのみ返却する。指定がない場合は全部返す
 * limit: 返却データ上限
 * offset: 返却データ開始位置
 * @param req
 * @param res
 * @param next
 */
export const readTemps = async (req: Request, res: Response, next: NextFunction) => {
    const { sort, fields, limit, offset } = req.query as Query
    const userId = req.body.userId

    // フィルター
    const { id, date, temp, createdAt, updatedAt } = req.query

    // ソートの内容を格納
    const sorts: { [key: string]: string }[] = []
    sort?.split(',').forEach(s => {
        if (s[0] === '-') {
            const property = s.slice(1)
            sorts.push({
                [property]: 'desc'
            })
        } else {
            sorts.push({
                [s]: 'asc'
            })
        }
    })

    // フィルターの内容を作成
    // 連想配列を定義
    const filter: { [key: string]: any } = {};

    // 中身があるパラメータだけ、キャストして連想配列に追加
    if (typeof id === 'string') {
        filter["id"] = Number(id);
    }
    if (typeof date === 'string') {
        filter["date"] = new Date(date);
    }
    if (typeof temp === 'string') {
        filter["temp"] = Number(temp);
    }
    if (typeof createdAt === 'string') {
        filter["createdAt"] = new Date(createdAt);
    }
    if (typeof updatedAt === 'string') {
        filter["updatedAt"] = new Date(updatedAt);
    }

    try {
        // 体温を取得
        const temps = await offsetTimePrisma.user_Temp.findMany({
            orderBy: sorts,
            where: {
                userId,
                ...filter
            },
            skip: offset ? Number(offset) : DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DEFAULT_DATA_INFO.limit
        })

        // 指定されたフィールドを抽出
        const fieldAry = fields?.split(',')
        const filteredTemps = temps.map((temp: { [key: string]: any }) => {
            // 指定なしの場合は全フィールド返す
            if(!fieldAry?.length) return temps

            // retに必要なフィールドだけ格納
            const ret: { [key: string]: any } = {}
            fieldAry.forEach(field => {
                const tempField = temp[field]
                if (tempField) ret[field] = tempField
            })
            return ret
        })

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": "[readTemp]response",
            "temps": filteredTemps
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}