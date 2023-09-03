import { DEFAULT_DATA_INFO } from "@/consts/db";
import { DELETE_WEIGHT, EDIT_WEIGHT, READ_WEIGHT, RECORD_WEIGHT, WEIGHT_ACCESS_FORBIDDEN } from "@/consts/responseConsts";
import { FilterOptionsType, createFilterForPrisma, createSortsForPrisma, filteringFields } from "@/services/dataTransferService";
import { offsetTimePrisma } from "@/services/prismaClients";
import { findUniqueUserAbsoluteExist, findUniqueUserWeightAbsoluteExist, userWeightType } from "@/services/prismaService";
import { basicResponce, internalServerErr } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
/**
 * 新たな体重記録を作成する
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, weight, date
 * @param res
 * @param next
 * @returns
 */
export const registWeight = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, weight, date } = req.body
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

        // 体重を追加
        const weightData = await offsetTimePrisma.user_Weight.create({
            data: {
                userId,
                day: dateForDb,
                time: dateForDb,
                weight
            }
        })

        res.status(200).json({
            "status": true,
            "message": RECORD_WEIGHT.message,
            "data": weightData
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}

/**
 * 体重のリストを取得
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
export const readWeights = async (req: Request, res: Response, next: NextFunction) => {
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
    const { id, date, weight, createdAt, updatedAt } = req.query
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
        weight: {
            data: weight,
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
        // 体重を取得
        const weights = await offsetTimePrisma.user_Weight.findMany({
            orderBy: sorts,
            where: {
                userId,
                ...filter
            },
            skip: offset ? Number(offset) : DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DEFAULT_DATA_INFO.limit
        })

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await offsetTimePrisma.user_Weight.count({
            where: { userId }
        })

        // 指定されたフィールドでフィルター
        const filteredWeights = filteringFields(fields, weights)

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": READ_WEIGHT.message,
            "allCount": allCount,
            "count": filteredWeights.length,
            "sort": sort ?? '',
            "fields": fields ?? '',
            "limit": limit ?? '',
            "offset": offset ?? '',
            "filter": {
                "id": id ?? '',
                "date": date ?? '',
                "weight": weight ?? '',
                "createdAt": createdAt ?? '',
                "updatedAt": updatedAt ?? ''
            },
            "weights": filteredWeights
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}

/**
 * 指定した体重の記録を編集する
 * jwtのuserIdと指定した体重記録のuserIdが合致するときのみ編集可能
 * 体重記録は、user_Weightのidをパラメータに挿入し指定する
 * BaseUrl/users/weights/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId, date, weight } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体重記録を取得
        const whereByWeightId = { id }
        const weightData = await findUniqueUserWeightAbsoluteExist(whereByWeightId, res) as userWeightType

        // 指定した体重記録がユーザー本人のものか確認
        const isSelfUser = (weightData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = WEIGHT_ACCESS_FORBIDDEN.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 編集するdataを成型
        type WeightData = {
            weight: number,
            day?: Date
            time?: Date
        }
        const data: WeightData = {
            weight
        }
        // dateが設定されているときのみdataに追加
        if (date) {
            data.day = new Date(date)
            data.time = new Date(date)
        }

        // 体重記録を編集
        const newWeight = await offsetTimePrisma.user_Weight.update({
            where: { id },
            data: data
        })

        res.status(200).json({
            "status": true,
            "message": EDIT_WEIGHT.message,
            "data": newWeight
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}

/**
 * 指定した体重の記録を削除する
 * jwtのuserIdと指定した体重記録のuserIdが合致するときのみ削除可能
 * 体重記録は、user_Weightのidをパラメータに挿入し指定する
 * BaseUrl/users/weights/edit/:id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId } = req.body

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体重記録を取得
        const whereByWeightId = { id }
        // FIXME: 例外を投げないと二回レスポンスを投げようとしてエラーになる。これ、まとめる意味があるかも含めてちょっと検討。
        const weightData = await findUniqueUserWeightAbsoluteExist(whereByWeightId, res) as userWeightType

        // 指定した体重記録がユーザー本人のものか確認
        const isSelfUser = (weightData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = WEIGHT_ACCESS_FORBIDDEN.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 体重記録を削除
        const newWeight = await offsetTimePrisma.user_Weight.delete({
            where: { id }
        })

        res.status(200).json({
            "status": true,
            "message": DELETE_WEIGHT.message,
            "data": newWeight
        });
    } catch (e) {
        internalServerErr(res, e)
    }
}