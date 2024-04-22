import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import { COUNT_BOWEL_MOVEMENT_PER_DAY } from "@/consts/responseMessages/messages/bowelMovement";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import { BadRequestError } from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { AnyRequest } from "@/utils/utilRequest";
import {
  BasicResponceType,
  basicHttpResponceIncludeData,
} from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "countBowelMovementsPerDay";

type VerifiedParamsType = {
  /** 編集対象の排便記録のid */
  id: number;
};
export type DailyBowelMovementsCounts = {
  day: Date;
  count: number;
}[];
type VerifiedResBodyType = BasicResponceType & {
  data: {
    allCount: number;
    counts: DailyBowelMovementsCounts;
  };
};
type VerifiedReqBodyType = undefined;
type VerifiedReqQueryType = undefined;
type VerifiedLocalsType = {
  userId: number;
};

export type VerifiedRequestType = Request<
  VerifiedParamsType,
  VerifiedResBodyType,
  VerifiedReqBodyType,
  VerifiedReqQueryType
>;
export type VerifiedResponseType = Response<
  VerifiedResBodyType,
  VerifiedLocalsType
>;

export const validationErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response,
) => {
  if (e instanceof BadRequestError) {
    badRequestErrorHandle(
      e,
      UNSPECIFIED_USER_ID.message,
      req,
      res,
      CURRENT_FUNCTION_NAME,
    );
  } else {
    throw e;
  }
};

export const countDailyBowelMovements = async (
  userId: number,
): Promise<DailyBowelMovementsCounts> => {
  // userの有無を確認(見つからなかったらPrismaからエラーがthrowされる)
  await customizedPrisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const dailyBowelMovementsCount =
    await customizedPrisma.bowel_Movement.groupBy({
      by: ["day"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
    });

  return dailyBowelMovementsCount.map((ele) => ({
    day: ele.day,
    count: ele._count._all,
  }));
};

export const countDailyBowelMovementsErrorHandle = (
  e: unknown,
  userId: number,
  req: AnyRequest,
  res: Response,
) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

export const sendResponse = (
  userId: number,
  req: AnyRequest,
  res: Response,
  dailyBowelMovementsCount: DailyBowelMovementsCounts,
) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = COUNT_BOWEL_MOVEMENT_PER_DAY.message;
  const data: VerifiedResBodyType["data"] = {
    allCount: dailyBowelMovementsCount.reduce(
      (prev, dailyCount) => dailyCount.count + prev,
      0,
    ),
    counts: dailyBowelMovementsCount,
  };
  basicHttpResponceIncludeData(
    res,
    httpStatus,
    responseStatus,
    responseMsg,
    data,
  );

  // ログを出力
  logResponse(userId, req, httpStatus, responseMsg, CURRENT_FUNCTION_NAME);
};
