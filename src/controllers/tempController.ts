import { DEFAULT_DATA_INFO } from "@/consts/db";
import { DELETE_TEMP, EDIT_TEMP, READ_TEMP, RECORD_TEMP, TEMP_ACCESS_FORBIDDEN, TEMP_NOT_FOUND, USER_NOT_FOUND } from "@/consts/responseConsts";
import { FilterOptionsType, createFilterForPrisma, createSortsForPrisma, filteringFields } from "@/services/dataTransferService";
import { offsetTimePrisma } from "@/services/prismaClients";
import { findUniqueUserTempAbsoluteExist, userTempType, findUniqueUserAbsoluteExist } from "@/services/prismaService";
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
        await findUniqueUserAbsoluteExist(whereByUserId, res)

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
                day: dateForDb,
                time: dateForDb,
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
    const sorts = createSortsForPrisma(sort)

    //  クエリで指定されたフィルターの内容を連想配列にまとめる
    const { id, date, temp, createdAt, updatedAt } = req.query
    const filterOptions: FilterOptionsType = {
        id: {
            data: id,
            constructor: (i) => Number(i)
        },
        day: {
            data: date,
            constructor: (i) => new Date(i)
        },
        time: {
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
    // 指定されたフィールドのみのオブジェクトを作成
    const filter = createFilterForPrisma(filterOptions)

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

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await offsetTimePrisma.user_Temp.count({
            where: { userId }
        })

        // 指定されたフィールドでフィルター
        const filteredTemps = filteringFields(fields, temps)

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": READ_TEMP.message,
            "allCount": allCount,
            "count": filteredTemps.length,
            "sort": sort ?? '',
            "fields": fields ?? '',
            "limit": limit ?? '',
            "offset": offset ?? '',
            "filter": {
                "id": id ?? '',
                "date": date ?? '',
                "temp": temp ?? '',
                "createdAt": createdAt ?? '',
                "updatedAt": updatedAt ?? ''
            },
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
 * BaseUrl/users/temps/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editTemp = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId, date, temp } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id }
        const tempData = await findUniqueUserTempAbsoluteExist(whereByTempId, res) as userTempType

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
            day?: Date
            time?: Date
        }
        const data: TempData = {
            temp
        }
        // dateが設定されているときのみdataに追加
        if (date) {
            data.day = new Date(date)
            data.time = new Date(date)
        }

        // 体温記録を編集
        const newTemp = await offsetTimePrisma.user_Temp.update({
            where: { id },
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

/**
 * 指定した体温の記録を削除する
 * jwtのuserIdと指定した体温記録のuserIdが合致するときのみ削除可能
 * 体温記録は、user_Tempのidをパラメータに挿入し指定する
 * BaseUrl/users/temps/edit/:id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteTemp = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id }
        const tempData = await findUniqueUserTempAbsoluteExist(whereByTempId, res) as userTempType

        // 指定した体温記録がユーザー本人のものか確認
        const isSelfUser = (tempData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 体温記録を削除
        const newTemp = await offsetTimePrisma.user_Temp.delete({
            where: { id }
        })

        res.status(200).json({
            "status": true,
            "message": DELETE_TEMP.message,
            "data": newTemp
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}
