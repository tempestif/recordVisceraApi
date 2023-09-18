import { USER_NOT_FOUND } from "@/consts/responseConsts"
import { customizedPrisma } from "../prismaClients"
import { basicHttpResponce } from "../utilResponseService"
import { Response } from "express"
import { Prisma } from "@prisma/client"
import { DbRecordNotFoundError } from "."

/**
 * DBより、ユーザーの存在確認、取得を行う。
 * ユーザーが存在しなかった場合はDbRecordNotFoundErrorを投げる
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserAbsoluteExist = async (where: Prisma.UserWhereUniqueInput, res: Response) => {
    // userIdからユーザーを取得
    const user = await customizedPrisma.user.findUnique({ where })
    // ユーザーが見つからなかったらDbRecordNotFoundErrorを投げる
    if (!user) {
        const responseMsg = USER_NOT_FOUND.message
        throw new DbRecordNotFoundError(responseMsg)
    }

    return user
}