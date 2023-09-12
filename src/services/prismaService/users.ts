import { USER_NOT_FOUND } from "@/consts/responseConsts"
import { customizedPrisma } from "../prismaClients"
import { basicResponce } from "../utilResponseService"
import { Response } from "express"
import { Prisma } from "@prisma/client"

// TODO: 絶対Prismaに型がある。探す。
export type UserType = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    name: string;
    password: string;
    authCode: string;
    verified: number;
}

/**
 * DBより、ユーザーの存在確認、取得を行う。
 * ユーザーが存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserAbsoluteExist = async (where: Prisma.UserWhereUniqueInput, res: Response) => {
    // userIdからユーザーを取得
    const user = await customizedPrisma.user.findUnique({ where })
    // ユーザーが見つからなかったら401エラー
    if (!user) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = USER_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return user
}