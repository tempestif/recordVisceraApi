import { TEMP_NOT_FOUND } from "@/consts/responseConsts"
import { offsetTimePrisma } from "../prismaClients"
import { basicResponce } from "../utilResponseService"
import { Response } from "express"
import { Prisma } from "@prisma/client"

// TODO: 絶対Prismaに型がある。探す。
export type userTempType = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    date: Date;
    temp: number;
}

/**
 * DBより、体温記録の存在確認、取得を行う。
 * 体温記録が存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserTempAbsoluteExist = async (where: Prisma.User_TempWhereUniqueInput, res: Response) => {
    // idから体温記録を取得
    const tempData = await offsetTimePrisma.user_Temp.findUnique({ where })
    // 体温記録が無かったら401エラー
    if (!tempData) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = TEMP_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return tempData
}