import { DEFAULT_DATA_INFO } from "@/consts/db";
import { EDIT_TEMP, RECORD_TEMP, TEMP_ACCESS_FORBIDDEN, TEMP_NOT_FOUND, USER_NOT_FOUND } from "@/consts/responseConsts";
import { offsetTimePrisma } from "@/services/prismaMiddleware";
import { basicResponce, internalServerErr } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
/**
 * 新たな体温記録を作成する
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, temp, date
 * @param res
 * @param next
 * @returns
 */
export const registTemp = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, temp, date } = req.body
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // userIdからユーザーを取得
        const whereByUserId = { id: userId }
        const user = await offsetTimePrisma.user.findUnique({ where: whereByUserId })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = USER_NOT_FOUND.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // dateをDate型に変換
        let dateForDb
        if (!date) {
            // dateが指定なしの場合、現在日時を入力
            dateForDb = new Date()
        } else {
            // dateが指定されていた場合、指定のdate
            dateForDb = new Date(date)
        }

        // 体温を追加
        const tempData = await offsetTimePrisma.user_Temp.create({
            data: {
                userId,
                date: dateForDb,
                temp
            }
        })

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
 * 体温のリストを取得
 * クエリで条件を指定
 * sort: 表示順 指定が早い順にandで並び変える
 * fields: 返却されるフィールド 指定されたフィールドのみ返却する。指定がない場合は全部返す
 * limit: 返却データ上限
 * offset: 返却データ開始位置
 * フィールド名: 値でフィルターを行う 一致する値のデータを返却
 * @param req
 * @param res
 * @param next
 */
export const readTemps = async (req: Request, res: Response, next: NextFunction) => {
    // クエリのデータを扱いやすくするための型を定義
    type Query = {
        sort: string | undefined
        fields: string | undefined
        limit: string | undefined
        offset: string | undefined
    }
    // フィルター以外の条件を取得
    const { sort, fields, limit, offset } = req.query as Query

    // bodyからuserIdを取得
    const userId = req.body.userId

    // 指定されたソートの内容をprismaに渡せるように成型
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

    // クエリで指定されたフィルターの内容をprismaに渡せるように成型
    const { id, date, temp, createdAt, updatedAt } = req.query
    // ループで処理するため、情報を連想配列にまとめる
    type FilterOptInfo = {
        data: any,
        constructor: (i: string) => any
    }
    const filterOptions: { [key: string]: FilterOptInfo } = {
        id: {
            data: id,
            constructor: (i) => Number(i)
        },
        date: {
            data: date,
            constructor: (i) => new Date(i)
        },
        temp: {
            data: temp,
            constructor: (i) => Number(i)
        },
        createdAt: {
            data: createdAt,
            constructor: (i) => new Date(i)
        },
        updatedAt: {
            data: updatedAt,
            constructor: (i) => new Date(i)
        },
    }

    // フィルターとして指定されたフィールドだけ、適するオブジェクトに変換してfilterに追加
    const filter: { [key: string]: any } = {};
    Object.keys(filterOptions).forEach(key => {
        // クエリから受け取った値
        const data = filterOptions[key].data
        // 値をfilterOptionsで設定したオブジェクトに変換したもの
        const objForFilter = filterOptions[key].constructor(filterOptions[key].data)
        if (typeof data === 'string') filter[key] = objForFilter
    })

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
            let ret

            if (!fieldAry?.length) {
                // 指定なしの場合は全フィールド返す
                ret = temp
            } else {
                // retに必要なフィールドだけ格納
                const filteredTemp: { [key: string]: any } = {}
                fieldAry.forEach(field => {
                    const tempField = temp[field]
                    if (tempField) filteredTemp[field] = tempField
                })
                ret = filteredTemp
            }
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

/**
 * 指定した体温の記録を編集する
 * jwtのuserIdと指定した体温記録のuserIdが合致するときのみ編集可能
 * 体温記録は、user_Tempのidをパラメータに挿入し指定する
 * BaseUrl/temps/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editTemps = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { userId, date, temp } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id: Number(id) }
        const tempData = await offsetTimePrisma.user_Temp.findUnique({ where: whereByTempId })
        // 体温記録が無かったら401エラー
        if (!tempData) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = TEMP_NOT_FOUND.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 指定した体温記録がユーザー本人のものか確認
        const isSelfUser = (tempData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 編集するdataを成型
        type TempData = {
            temp: number,
            date?: Date
        }
        const data: TempData = {
            temp
        }
        // dateが設定されているときのみdataに追加
        if (date) {
            data.date = new Date(date)
        }

        // 体温記録を編集
        const newTemp = await offsetTimePrisma.user_Temp.update({
            where: whereByTempId,
            data: data
        })

        res.status(200).json({
            "status": true,
            "message": EDIT_TEMP.message,
            "data": newTemp
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}
