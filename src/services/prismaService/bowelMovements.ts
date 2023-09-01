import { Prisma } from "@prisma/client";
import { offsetTimePrisma } from "../prismaClients";
import { basicResponce } from "../utilResponseService";
import { BOWEL_MOVEMENT_NOT_FOUND } from "@/consts/responseConsts/bowelMovement";
import { Response } from "express";

// TODO: 絶対Prismaに型がある。探す。
export type bowelMovementType = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    date: Date;
    blood: number,
    drainage: number,
    note: string,
    scaleId: number,

}

/**
 * DBより、排便記録の存在確認、取得を行う。
 * 排便記録が存在しなかった場合は401エラー
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueBowelMovementAbsoluteExist = async (where: Prisma.Bowel_MovementWhereUniqueInput, res: Response) => {
    // idから排便記録を取得
    const bowelMovementData = await offsetTimePrisma.bowel_Movement.findUnique({ where })
    // 排便記録が無かったら401エラー
    if (!bowelMovementData) {
        const HttpStatus = 401
        const responseStatus = false
        const responseMsg = BOWEL_MOVEMENT_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    return bowelMovementData
}