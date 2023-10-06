import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts";
import { DAILY_REPORT_ACCESS_FORBIDDEN, EDIT_DAILY_REPORT, READ_DAILY_REPORT, RECORD_DAILY_REPORT } from "@/consts/responseConsts";
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService";
import { createFilterForPrisma, createSortsForPrisma, filteringFields, FilterOptionsType } from "@/services/dataTransferService";
import { ErrorHandleIncludeDbRecordNotFound } from "@/services/errorHandlingService";
import { customizedPrisma } from "@/services/prismaClients";
import { createDailyReport, findUniqueDailyReportAbsoluteExist, findUniqueUserAbsoluteExist } from "@/services/prismaService";
import { basicHttpResponce, basicHttpResponceIncludeData } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client"
import { DAILY_REPORT_DEFAULT_DATA_INFO } from "@/consts/db/dailyReport";
const logger = new CustomLogger()

/**
 * 今日の体調を作成
 * 紐づくテーブルの情報も全て受け取り、必要に応じて値の格納を行う。
 * bodyに入っていないテーブルも作成する
 * 体温
 * 体重
 * 腹痛
 * 体調
 * 関節痛の有無
 * 皮膚病変の有無
 * 眼病変の有無
 * 肛門病変の有無
 * 腹部腫瘤の有無
 * @param req
 * @param res
 * @param next
 */
export const registDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    // logのために関数名を取得
    const currentFuncName = registDailyReport.name
    // TODO: バリデーション

    // bodyから情報を取得
    const {
        userId,
        date,
        // 体温
        temp,
        // 体重
        weight,
        // 腹痛
        stomachach,
        // 体調
        condition,
        // 関節痛の有無
        arthritis,
        // 皮膚病変の有無
        skinLesitions,
        // 眼病変の有無
        ocularLesitions,
        // 痔瘻の有無
        anirectalLesitions,
        // その他の肛門病変の有無
        anirectalOtherLesitions,
        // 腹部腫瘤の有無
        abdominal
    } = req.body

    try {
        // idからユーザーの存在確認
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

        // dailyReport追加
        const dailyReport = await createDailyReport(userId, dateForDb, {
            temp,
            weight,
            stomachach,
            condition,
            arthritis,
            skinLesitions,
            ocularLesitions,
            anirectalLesitions,
            anirectalOtherLesitions,
            abdominal
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = RECORD_DAILY_REPORT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, dailyReport)

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
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
 * 今日の体調を取得
 * @param req
 * @param res
 * @param next
 */
export const readDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    // logのために関数名を取得
    const currentFuncName = readDailyReport.name
    // TODO: バリデーション
    // クエリのデータを扱いやすくするための型を定義
    type Query = {
        sort: string | undefined
        fields: string | undefined
        limit: string | undefined
        offset: string | undefined
        id: string | undefined
        temp: string | undefined
        weight: string | undefined
        stomachach: string | undefined
        condition: string | undefined
        arthritis: string | undefined
        skinLesitions: string | undefined
        ocularLesitions: string | undefined
        anirectalLesitions: string | undefined
        anirectalOtherLesitions: string | undefined
        abdominal: string | undefined
        createdAt: string | undefined
        updatedAt: string | undefined
    }
    // フィルター以外の条件を取得
    const { sort, fields, limit, offset } = req.query as Query
    // 指定されたソートの内容をprismaに渡せるように成型
    const sorts = createSortsForPrisma(sort)

    // クエリで指定されたフィルターの内容を連想配列にまとめる
    const {
        id,
        temp,
        weight,
        stomachach,
        condition,
        arthritis,
        skinLesitions,
        ocularLesitions,
        anirectalLesitions,
        anirectalOtherLesitions,
        abdominal,
        createdAt,
        updatedAt
    } = req.query as Query
    const filterOptions = createDailyReportFilterOptions(id, temp, weight, stomachach, condition, arthritis, skinLesitions, ocularLesitions, anirectalLesitions, anirectalOtherLesitions, abdominal, createdAt, updatedAt)
    // 指定されたフィールドのみのオブジェクトを作成
    const filter = createFilterForPrisma(filterOptions)

    // bodyからuserIdを取得
    const userId = req.body.userId
    // paramから年月日を取得
    const { year, month, day } = req.params

    try {
        // bodyの年月日をDate型に変換
        let dateForDb
        if (year && month && day) {
            dateForDb = new Date(`${year}-${month}-${day}`)
        }
        // 今日の体調を取得
        const dailyReports = await customizedPrisma.daily_Report.findMany({
            where: {
                userId,
                day: dateForDb,
                ...filter
            },
            orderBy: sorts,
            skip: offset ? Number(offset) : DAILY_REPORT_DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DAILY_REPORT_DEFAULT_DATA_INFO.limit
        })

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await customizedPrisma.daily_Report.count({
            where: {
                userId
            }
        })

        // 指定されたフィールドのみ抜き出す
        const fileteredDailyReports = filteringFields(fields, dailyReports)

        // レスポンス返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = READ_DAILY_REPORT.message
        res.status(HttpStatus).json({
            "status": responseStatus,
            "message": responseMsg,
            "allCount": allCount,
            "count": fileteredDailyReports.length,
            "sort": sort ?? '',
            "fields": fields ?? '',
            "limit": limit ?? '',
            "offset": offset ?? '',
            "filter": {
                "id": id ?? '',
                "temp": temp ?? '',
                "weight": weight ?? '',
                "stomachach": stomachach ?? '',
                "condition": condition ?? '',
                "arthritis": arthritis ?? '',
                "skinLesitions": skinLesitions ?? '',
                "ocularLesitions": ocularLesitions ?? '',
                "anirectalLesitions": anirectalLesitions ?? '',
                "anirectalOtherLesitions": anirectalOtherLesitions ?? '',
                "abdominal": abdominal ?? '',
                "createdAt": createdAt ?? '',
                "updatedAt": updatedAt ?? ''
            },
            "dailyReports": fileteredDailyReports
        });

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
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
 * 今日の体調のフィルターオプションを作成
 * createFilterForPrismaの引数に使う
 * @param id
 * @param temp
 * @param weight
 * @param stomachach
 * @param condition
 * @param arthritis
 * @param skinLesitions
 * @param ocularLesitions
 * @param anirectalLesitions
 * @param anirectalOtherLesitions
 * @param abdominal
 * @param createdAt
 * @param updatedAt
 * @returns
 */
const createDailyReportFilterOptions = (
    id: string | undefined,
    temp: string | undefined,
    weight: string | undefined,
    stomachach: string | undefined,
    condition: string | undefined,
    arthritis: string | undefined,
    skinLesitions: string | undefined,
    ocularLesitions: string | undefined,
    anirectalLesitions: string | undefined,
    anirectalOtherLesitions: string | undefined,
    abdominal: string | undefined,
    createdAt: string | undefined,
    updatedAt: string | undefined
): FilterOptionsType => {
    const filterOptions: FilterOptionsType = {
        id: {
            data: id,
            constructor: (i) => Number(i)
        },
        temp: {
            data: temp,
            constructor: (i) => Number(i)
        },
        weight: {
            data: weight,
            constructor: (i) => Number(i)
        },
        stomachach: {
            data: stomachach,
            constructor: (i) => Number(i)
        },
        condition: {
            data: condition,
            constructor: (i) => Number(i)
        },
        arthritis: {
            data: arthritis,
            constructor: (i) => Number(i)
        },
        skinLesitions: {
            data: skinLesitions,
            constructor: (i) => Number(i)
        },
        ocularLesitions: {
            data: ocularLesitions,
            constructor: (i) => Number(i)
        },
        anirectalLesitions: {
            data: anirectalLesitions,
            constructor: (i) => Number(i)
        },
        anirectalOtherLesitions: {
            data: anirectalOtherLesitions,
            constructor: (i) => Number(i)
        },
        abdominal: {
            data: abdominal,
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

    return filterOptions
}

/**
 * 今日の体調を編集
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const editDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const userId = Number(req.body.userId)
    const {
        date,
        temp,
        weight,
        stomachach,
        condition,
        arthritis,
        skinLesitions,
        ocularLesitions,
        anirectalLesitions,
        anirectalOtherLesitions,
        abdominal
    } = req.body

    // logのために関数名を取得
    const currentFuncName = editDailyReport.name

    // TODO: バリデーション
    try {
        // idから今日の体調を取得
        const whereByDailyReportId = { id }
        const dailyReport = await customizedPrisma.daily_Report.findUniqueOrThrow({ where: whereByDailyReportId })
        // 指定した今日の体調がユーザー本人のものか確認
        const isSelfUser = (dailyReport.userId === userId)
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403
            const responseStatus = false
            const responseMsg = DAILY_REPORT_ACCESS_FORBIDDEN.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId: userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody)

            return
        }

        // 編集するdataを成型
        const dailyReportData = createUpdateData(date, temp, weight, stomachach, condition, arthritis, skinLesitions, ocularLesitions, anirectalLesitions, anirectalOtherLesitions, abdominal)

        // 編集
        const newDailyReport = await customizedPrisma.daily_Report.update({
            where: whereByDailyReportId,
            data: dailyReportData,
            include: {
                Daily_report_Temp: true,
                Daily_report_Weight: true,
                Daily_report_Stomachache: true,
                Daily_report_Condition: true,
                Daily_report_Arthritis: true,
                Daily_report_Skin_Lesions: true,
                Daily_report_Ocular_Lesitions: true,
                Daily_report_Anorectal_Lesitions: true,
                Daily_report_Abdominal: true
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = EDIT_DAILY_REPORT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, newDailyReport)

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

const createUpdateData = (date: string, temp: string, weight: string, stomachach: string, condition: string, arthritis: string, skinLesitions: string, ocularLesitions: string, anirectalLesitions: string, anirectalOtherLesitions: string, abdominal: string) => {
    const data: Prisma.Daily_ReportUpdateInput = {}
    if (date) {
        data.day = new Date(date)
        data.time = new Date(date)
    }
    if (temp) {
        data.Daily_report_Temp = {
            update: {
                result: Number(temp)
            }
        }
    }
    if (weight) {
        data.Daily_report_Weight = {
            update: {
                result: Number(weight)
            }
        }
    }
    if (stomachach) {
        data.Daily_report_Stomachache = {
            update: {
                stomachache_Scale_TypesId: Number(stomachach)
            }
        }
    }
    if (condition) {
        data.Daily_report_Condition = {
            update: {
                condition_Scale_TypesId: Number(condition)
            }
        }
    }
    if (arthritis) {
        data.Daily_report_Arthritis = {
            update: {
                result: Number(arthritis)
            }
        }
    }
    if (skinLesitions) {
        data.Daily_report_Skin_Lesions = {
            update: {
                result: Number(skinLesitions)
            }
        }
    }
    if (ocularLesitions) {
        data.Daily_report_Ocular_Lesitions = {
            update: {
                result: Number(ocularLesitions)
            }
        }
    }
    if (anirectalLesitions) {
        data.Daily_report_Anorectal_Lesitions = {
            update: {
                fistula: Number(anirectalLesitions)
            }
        }
    }
    if (anirectalOtherLesitions) {
        data.Daily_report_Anorectal_Lesitions = {
            update: {
                others: Number(anirectalOtherLesitions)
            }
        }
    }
    if (abdominal) {
        data.Daily_report_Abdominal = {
            update: {
                abdominal_Scale_TypesId: Number(abdominal)
            }
        }
    }

    return data
}

export const deleteDailyReport = async (req: Request, res: Response, next: NextFunction) => { }
