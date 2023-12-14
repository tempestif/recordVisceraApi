import { TEMP_NOT_FOUND } from "@/consts/responseConsts";
import { customizedPrisma } from "../prismaClients";
import { Prisma } from "@prisma/client";
import { DbRecordNotFoundError } from ".";

/**
 * DBより、体温記録の存在確認、取得を行う。
 * 体温記録が存在しなかった場合はDbRecordNotFoundErrorを投げる
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserTempAbsoluteExist = async (
    where: Prisma.Daily_report_TempWhereUniqueInput,
    prismaClient: typeof customizedPrisma
) => {
    // idから体温記録を取得
    const tempData = await prismaClient.daily_report_Temp.findUnique({
        where,
    });
    // 体温記録が無かったらDbRecordNotFoundErrorを投げる
    if (!tempData) {
        const responseMsg = TEMP_NOT_FOUND.message;
        throw new DbRecordNotFoundError(responseMsg);
    }

    return tempData;
};
