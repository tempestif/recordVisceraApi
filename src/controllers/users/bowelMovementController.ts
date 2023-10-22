import { DEFAULT_DATA_INFO } from "@/consts/db";
import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts";
import { BOWEL_MOVEMENT_ACCESS_FORBIDDEN, COUNT_BOWEL_MOVEMENT_PER_DAY, DELETE_BOWEL_MOVEMENT, EDIT_BOWEL_MOVEMENT, READ_BOWEL_MOVEMENT, RECORD_BOWEL_MOVEMENT } from "@/consts/responseConsts/bowelMovement";
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService";
import { FilterOptionsType, createFilterForPrisma, createSortsForPrisma, filteringFields } from "@/services/dataTransferService";
import { ErrorHandleIncludeDbRecordNotFound, internalServerErrorHandle } from "@/services/errorHandlingService";
import { customizedPrisma } from "@/services/prismaClients";
import { findUniqueUserAbsoluteExist } from "@/services/prismaService";
import { findUniqueBowelMovementAbsoluteExist } from "@/services/prismaService/bowelMovements";
import { basicHttpResponce, basicHttpResponceIncludeData } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
const logger = new CustomLogger()

/**
 * 新たな排便記録を作成する
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, bristolStoolScale, blood, drainage, note, date
 * @param res
 * @param next
 * @returns
 */
export const registBowelMovement = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, bristolStoolScale, blood, drainage, note, date } = req.body

    // logのために関数名を取得
    const currentFuncName = registBowelMovement.name
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

        // 排便記録を追加
        const bowelMovementData = await customizedPrisma.bowel_Movement.create({
            data: {
                userId,
                day: dateForDb,
                time: dateForDb,
                blood,
                drainage,
                note,
                bristolStoolScale
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = RECORD_BOWEL_MOVEMENT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, bowelMovementData)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}

/**
 * 排便記録のリストを取得
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
export const readBowelMovements = async (req: Request, res: Response, next: NextFunction) => {
    // logのために関数名を取得
    const currentFuncName = readBowelMovements.name
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
    const { id, date, blood, drainage, note, bristolStoolScale, createdAt, updatedAt } = req.query
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
        blood: {
            data: blood,
            constructor: (i) => Number(i)
        },
        drainage: {
            data: drainage,
            constructor: (i) => Number(i)
        },
        note: {
            data: note,
            constructor: (i) => String(i)
        },
        bristolStoolScale: {
            data: bristolStoolScale,
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
        // 排便記録を取得
        const bowelMovents = await customizedPrisma.bowel_Movement.findMany({
            orderBy: sorts,
            where: {
                userId,
                ...filter
            },
            skip: offset ? Number(offset) : DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DEFAULT_DATA_INFO.limit
        })

        // 指定されたフィールドでフィルター
        const filteredBowelMovents = filteringFields(fields, bowelMovents)

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await customizedPrisma.bowel_Movement.count({
            where: { userId }
        })

        // レスポンス
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = READ_BOWEL_MOVEMENT.message
        res.status(HttpStatus).json({
            "status": responseStatus,
            "message": responseMsg,
            "allCount": allCount,
            "count": filteredBowelMovents.length,
            "sort": sort ?? '',
            "fields": fields ?? '',
            "limit": limit ?? '',
            "offset": offset ?? '',
            "filter": {
                "id": id ?? '',
                "date": date ?? '',
                "blood": blood ?? '',
                "drainage": drainage ?? '',
                "note": note ?? '',
                "bristolStoolScale": bristolStoolScale ?? '',
                "createdAt": createdAt ?? '',
                "updatedAt": updatedAt ?? ''
            },
            "bowelMovements": filteredBowelMovents
        });

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        internalServerErrorHandle(e, userId, req, res, currentFuncName)
    }
}

/**
 * 指定した排便記録を編集する
 * jwtのuserIdと指定した排便記録のuserIdが合致するときのみ編集可能
 * 排便記録は、bowel_movementのidをパラメータに挿入し指定する
 * BaseUrl/users/bowel-movements/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editBowelMovement = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId, date, blood, drainage, note, bristolStoolScale } = req.body

    // logのために関数名を取得
    const currentFuncName = editBowelMovement.name

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから排便記録を取得
        const whereByBowelMovementId = { id }
        const bowelMoventData = await findUniqueBowelMovementAbsoluteExist(whereByBowelMovementId, res)

        // 指定した体温記録がユーザー本人のものか確認
        const isSelfUser = (bowelMoventData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = BOWEL_MOVEMENT_ACCESS_FORBIDDEN.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(editBowelMovement.name), logBody)

            return
        }

        // 編集するdataを成型
        // NOTE: Prisma.$Bowel_MovementPayload['scalars']; これ使えるかも
        // TODO: どれが必須であるべきか要検討。blood,drainage, bristolStoolScaleも必須じゃないのでは？
        type BowelMovementData = {
            blood: number,
            drainage: number,
            bristolStoolScale: number,
            note?: string,
            day?: Date
            time?: Date
        }
        const data: BowelMovementData = {
            blood,
            drainage,
            bristolStoolScale
        }
        // dateが設定されているときのみdataに追加
        if (date) {
            data.day = new Date(date)
            data.time = new Date(date)
        }
        // noteが設定されているときのみ追加
        if (note) {
            data.note = note
        }

        // 排便記録を編集
        const newBowelMovement = await customizedPrisma.bowel_Movement.update({
            where: { id },
            data: data
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = EDIT_BOWEL_MOVEMENT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, newBowelMovement)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}

/**
 * 指定した排便記録を削除する
 * jwtのuserIdと指定した排便記録のuserIdが合致するときのみ削除可能
 * 排便記録は、bowel_movementのidをパラメータに挿入し指定する
 * BaseUrl/users/bowel-movements/edit/:id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteBowelMovement = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = deleteBowelMovement.name

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから排便記録を取得
        const whereByBowelMoventId = { id }
        const bowelMoventData = await findUniqueBowelMovementAbsoluteExist(whereByBowelMoventId, res)

        // 指定した排便記録がユーザー本人のものか確認
        const isSelfUser = (bowelMoventData.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = BOWEL_MOVEMENT_ACCESS_FORBIDDEN.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(deleteBowelMovement.name), logBody)

            return
        }

        // 排便記録を削除
        const newBowelMovement = await customizedPrisma.bowel_Movement.delete({
            where: { id }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = DELETE_BOWEL_MOVEMENT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, newBowelMovement)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}

export const countBowelMovementsPerDay = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = countBowelMovementsPerDay.name

    // クエリのデータを扱いやすくするための型を定義
    type Query = {
        limit: string | undefined
        offset: string | undefined
    }
    const { limit, offset } = req.query as Query

    try {
        // userIdからユーザーの存在を確認
        const whereByUserId = { id: userId }
        await findUniqueUserAbsoluteExist(whereByUserId, res)

        // groupBy()で日付毎にカウント。
        const groupBowelMovements = await customizedPrisma.bowel_Movement.groupBy({
            by: ['day'],
            where: {
                userId
            },
            _count: {
                _all: true
            }
        })

        // クエリがなかったらデフォルト値を利用
        const offsetNum = offset ? Number(offset) : DEFAULT_DATA_INFO.offset
        const limitNum = limit ? Number(limit) : DEFAULT_DATA_INFO.limit

        // クエリの範囲のみ切り出し
        const start = offsetNum
        const end = start + limitNum
        const slicedGroupBowelMovements = groupBowelMovements.slice(start, end)

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COUNT_BOWEL_MOVEMENT_PER_DAY.message
        res.status(HttpStatus).json({
            "status": responseStatus,
            "message": responseMsg,
            "allCount": groupBowelMovements.length,
            "count": slicedGroupBowelMovements.length,
            "data": slicedGroupBowelMovements
        });

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}
