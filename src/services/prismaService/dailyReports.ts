import { Prisma } from "@prisma/client"
import { customizedPrisma } from "../prismaClients"
import { basicHttpResponce } from "../utilResponseService"
import { Response } from "express"
import { DAILY_REPORT_NOT_FOUND } from "@/consts/responseConsts"
import { DbRecordNotFoundError } from "."

/**
 * DBより、今日の体調の存在確認、取得を行う。
 * 今日の体調が存在しなかった場合はDbRecordNotFoundErrorを投げる
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueDailyReportAbsoluteExist = async (where: Prisma.Daily_ReportWhereUniqueInput, res: Response) => {
    // idから今日の体調を取得
    const tempData = await customizedPrisma.daily_Report.findUnique({ where })
    // 今日の体調が無かったらDbRecordNotFoundErrorを投げる
    if (!tempData) {
        const responseMsg = DAILY_REPORT_NOT_FOUND.message
        throw new DbRecordNotFoundError(responseMsg)
    }

    return tempData
}