import { DEFAULT_DATA_INFO } from "@/consts/db";
import { DELETE_TEMP, EDIT_TEMP, READ_TEMP, RECORD_TEMP, TEMP_ACCESS_FORBIDDEN, TEMP_NOT_FOUND, USER_NOT_FOUND } from "@/consts/responseConsts";
import { FilterOptionsType, createFilterForPrisma, createSortsForPrisma, filteringFields } from "@/services/dataTransferService";
import { customizedPrisma } from "@/services/prismaClients";
import { findUniqueUserTempAbsoluteExist, findUniqueDailyReportAbsoluteExist, DbRecordNotFoundError } from "@/services/prismaService";
import { basicHttpResponce, internalServerErr } from "@/services/utilResponseService";
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
    const { userId, temp } = req.body
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // userIdから今日の体調を取得
        const whereByUserId = { id: userId }
        const dailyReport = await findUniqueDailyReportAbsoluteExist(whereByUserId, res)

        // 体温を追加
        const tempData = await customizedPrisma.daily_report_Temp.create({
            data: {
                dailyReportId: dailyReport.id,
                result: temp
            }
        })

        res.status(200).json({
            "status": true,
            "message": RECORD_TEMP.message,
            "data": tempData
        });
    } catch (e) {
        if (e instanceof DbRecordNotFoundError) {
            // レコードが見つからなかったら401エラー
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = e.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)
        } else {
            internalServerErr(res, e)
        }
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
    const { id, temp, createdAt, updatedAt } = req.query
    const filterOptions: FilterOptionsType = {
        id: {
            data: id,
            constructor: (i) => Number(i)
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

    // userIdからdailyReportIdを取得
    const whereByUserId = { id: userId }
    const dailyReport = await findUniqueDailyReportAbsoluteExist(whereByUserId, res)
    const dailyReportId = dailyReport.id
    try {
        // 体温を取得
        const temps = await customizedPrisma.daily_report_Temp.findMany({
            orderBy: sorts,
            where: {
                dailyReportId,
                ...filter
            },
            skip: offset ? Number(offset) : DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DEFAULT_DATA_INFO.limit
        })

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await customizedPrisma.daily_report_Temp.count({
            where: { dailyReportId }
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
    const { userId, temp } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id }
        const tempData = await findUniqueUserTempAbsoluteExist(whereByTempId, res)

        // 指定した体温記録がユーザー本人のものか確認
        const dailyReport = await findUniqueDailyReportAbsoluteExist({ id: tempData.dailyReportId }, res)
        const isSelfUser = (dailyReport.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message
            return basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 編集するdataを成型
        const data = {
            result: temp
        }

        // 体温記録を編集
        const newTemp = await customizedPrisma.daily_report_Temp.update({
            where: { id },
            data: data
        })

        res.status(200).json({
            "status": true,
            "message": EDIT_TEMP.message,
            "data": newTemp
        });
    } catch (e) {
        if (e instanceof DbRecordNotFoundError) {
            // レコードが見つからなかったら401エラー
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = e.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)
        } else {
            internalServerErr(res, e)
        }
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
        const tempData = await findUniqueUserTempAbsoluteExist(whereByTempId, res)

        // 指定した体温記録がユーザー本人のものか確認
        const dailyReport = await findUniqueDailyReportAbsoluteExist({ id: tempData.dailyReportId }, res)
        const isSelfUser = (dailyReport.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message
            return basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 体温記録を削除
        const newTemp = await customizedPrisma.daily_report_Temp.delete({
            where: { id }
        })

        res.status(200).json({
            "status": true,
            "message": DELETE_TEMP.message,
            "data": newTemp
        });
    } catch (e) {
        if (e instanceof DbRecordNotFoundError) {
            // レコードが見つからなかったら401エラー
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = e.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)
        } else {
            internalServerErr(res, e)
        }
    }
}
