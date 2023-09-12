import { PROFILE_NOT_FOUND } from "@/consts/responseConsts";
import { Prisma } from "@prisma/client";
import { customizedPrisma } from "../prismaClients";
import { basicResponce } from "../utilResponseService";
import { Response } from "express";

// TODO: 絶対Prismaに型がある。探す。
export type ProfileType = {
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
 * DBより、プロフィールの存在確認、取得を行う。
 * プロフィールが存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueProfileAbsoluteExist = async (where: Prisma.ProfileWhereUniqueInput, res: Response) => {
    // userIdからプロフィールを取得
    const profile = await customizedPrisma.profile.findUnique({ where })
    // プロフィールが見つからなかったら401エラー
    if (!profile) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = PROFILE_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return profile
}