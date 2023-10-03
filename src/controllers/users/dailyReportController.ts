import { PROCESS_SUCCESS } from "@/consts/logConsts";
import { RECORD_DAILY_REPORT } from "@/consts/responseConsts";
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService";
import { ErrorHandleIncludeDbRecordNotFound } from "@/services/errorHandlingService";
import { createDailyReport, findUniqueUserAbsoluteExist } from "@/services/prismaService";
import { basicHttpResponceIncludeData } from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
const logger = new CustomLogger()

/**
 * 今日の体調を作成
 * 紐づくテーブルの情報も全て受け取り、必要に応じて値の格納を行う。
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

export const readDailyReport = async (req: Request, res: Response, next: NextFunction) => { }
export const editDailyReport = async (req: Request, res: Response, next: NextFunction) => { }
export const deleteDailyReport = async (req: Request, res: Response, next: NextFunction) => { }
