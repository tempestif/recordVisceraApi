import { PROFILE_NOT_FOUND } from "@/consts/responseConsts";
import { Prisma } from "@prisma/client";
import { customizedPrisma } from "../prismaClients";
import { basicHttpResponce } from "../utilResponseService";
import { Response } from "express";
import { DbRecordNotFoundError } from ".";

/**
 * DBより、プロフィールの存在確認、取得を行う。
 * プロフィールが存在しなかった場合はDbRecordNotFoundErrorを投げる
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueProfileAbsoluteExist = async (where: Prisma.ProfileWhereUniqueInput, res: Response) => {
    // userIdからプロフィールを取得
    const profile = await customizedPrisma.profile.findUnique({ where })
    // プロフィールが見つからなかったらDbRecordNotFoundErrorを投げる
    if (!profile) {
        const responseMsg = PROFILE_NOT_FOUND.message
        throw new DbRecordNotFoundError(responseMsg)
    }

    return profile
}