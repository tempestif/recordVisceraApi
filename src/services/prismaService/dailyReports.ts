import { Prisma } from "@prisma/client"
import { customizedPrisma } from "../prismaClients"
import { basicResponce } from "../utilResponseService"
import { Response } from "express"
import { DAILY_REPORT_NOT_FOUND } from "@/consts/responseConsts"

// TODO: 絶対Prismaに型がある。探す。
export type dailyReportType = {
    day: Date;
    time: Date;
    id: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * DBより、今日の体調の存在確認、取得を行う。
 * 今日の体調が存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueDailyReportAbsoluteExist = async (where: Prisma.Daily_ReportWhereUniqueInput, res: Response) => {
    // idから今日の体調を取得
    const tempData = await customizedPrisma.daily_Report.findUnique({ where })
    // 今日の体調が無かったら401エラー
    if (!tempData) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = DAILY_REPORT_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return tempData
}