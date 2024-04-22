import { USER_LOGIN_STATUS } from "@/consts/dbMappings";
import { ERROR_USER_NOT_FOUND } from "@/consts/responseMessages";
import { DbRecordNotFoundError } from "@/utils/errorHandle/errors";
import { customizedPrisma } from "@/utils/prismaClients";
import { Prisma } from "@prisma/client";

/**
 * DBより、ユーザーの存在確認、取得を行う。
 * ユーザーが存在しなかった場合はDbRecordNotFoundErrorを投げる
 * TODO: findUniqueOrThrowに換装する
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueUserAbsoluteExist = async (
  where: Prisma.UserWhereUniqueInput,
  prismaClient: typeof customizedPrisma
) => {
  // userIdからユーザーを取得
  const user = await prismaClient.user.findUnique({ where });
  // ユーザーが見つからなかったらDbRecordNotFoundErrorを投げる
  if (!user) {
    const responseMsg = ERROR_USER_NOT_FOUND.message;
    throw new DbRecordNotFoundError(responseMsg);
  }

  return user;
};

/**
 * 退会済み以外のユーザーを探す
 * 退会済みのみ or ユーザーがない場合、DbRecordNotFoundErrorを投げる
 * @param where
 * @returns
 */
// FIXME: userが0のときにエラーを投げることが伝わらない。
export const findActivedUsers = async (
  where: Prisma.UserWhereInput,
  prismaClient: typeof customizedPrisma
) => {
  const users = await prismaClient.user.findMany({
    where: {
      ...where,
      NOT: {
        loginStatus: USER_LOGIN_STATUS.deactived,
      },
    },
  });

  if (users.length === 0) {
    const responseMsg = ERROR_USER_NOT_FOUND.message;
    throw new DbRecordNotFoundError(responseMsg);
  }

  return users;
};
