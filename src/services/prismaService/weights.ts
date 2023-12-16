import { customizedPrisma } from "../prismaClients";
import { Prisma } from "@prisma/client";
import { WEIGHT_NOT_FOUND } from "@/consts/responseConsts/weight";
import { DbRecordNotFoundError } from ".";

/**
 * DBより、体重記録の存在確認、取得を行う。
 * 体重記録が存在しなかった場合はDbRecordNotFoundErrorを投げる
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserWeightAbsoluteExist = async (
    where: Prisma.Daily_report_WeightWhereUniqueInput,
    prismaClient: typeof customizedPrisma
) => {
    // idから体重記録を取得
    const weightData = await prismaClient.daily_report_Weight.findUnique({
        where,
    });
    // 体重記録が無かったらDbRecordNotFoundErrorを投げる
    if (!weightData) {
        const responseMsg = WEIGHT_NOT_FOUND.message;
        throw new DbRecordNotFoundError(responseMsg);
    }

    return weightData;
};
