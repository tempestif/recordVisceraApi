import { customizedPrisma } from "../prismaClients"
import { basicResponce } from "../utilResponseService"
import { Response } from "express"
import { Prisma } from "@prisma/client"
import { WEIGHT_NOT_FOUND } from "@/consts/responseConsts/weight"

// TODO: 絶対Prismaに型がある。探す。
export type userWeightType = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    dailyReportId: number;
    result: number;
}

/**
 * DBより、体重記録の存在確認、取得を行う。
 * 体重記録が存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserWeightAbsoluteExist = async (where: Prisma.Daily_report_WeightWhereUniqueInput, res: Response) => {
    // idから体重記録を取得
    const weightData = await customizedPrisma.daily_report_Weight.findUnique({ where })
    // 体重記録が無かったら401エラー
    if (!weightData) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = WEIGHT_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return weightData
}