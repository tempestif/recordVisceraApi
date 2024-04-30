import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import {
  DELETE_BOWEL_MOVEMENT,
  ERROR_BOWEL_MOVEMENT_ACCESS_FORBIDDEN,
} from "@/consts/responseMessages/messages/bowelMovement";
import {
  accessForbiddenErrorHandle,
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  AccessForbiddenError,
  BadRequestError,
} from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { AnyRequest } from "@/utils/utilRequest";
import {
  BasicResponceType,
  basicHttpResponceIncludeData,
} from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "deleteBowelMovement";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = {
  /** 編集対象の排便記録のid */
  id: number;
};
export type VerifiedResBodyType = BasicResponceType & {
  data: Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["delete"]["result"];
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

export const deleteBowelMovement = async (id: number, userId: number) => {
  // userIdの本人確認
  const bowelMoventData =
    await customizedPrisma.bowel_Movement.findUniqueOrThrow({ where: { id } });
  if (bowelMoventData.userId !== userId) {
    // userIdが一致しなかったらForbiddenErrorを投げる
    throw new AccessForbiddenError(
      ERROR_BOWEL_MOVEMENT_ACCESS_FORBIDDEN.message,
    );
  }

  // 削除処理
  const deletedBowelMovement = await customizedPrisma.bowel_Movement.delete({
    where: { id },
  });
  return deletedBowelMovement;
};

export const deleteBowelMovementErrorHandle = (
  e: unknown,
  userId: number,
  req: AnyRequest,
  res: Response,
) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else if (e instanceof AccessForbiddenError) {
    accessForbiddenErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

export const sendResponse = (
  userId: number,
  req: AnyRequest,
  res: Response,
  deletedBowelMovement: VerifiedResBodyType["data"],
) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = DELETE_BOWEL_MOVEMENT.message;
  basicHttpResponceIncludeData(
    res,
    httpStatus,
    responseStatus,
    responseMsg,
    deletedBowelMovement,
  );

  // ログを出力
  logResponse(userId, req, httpStatus, responseMsg, CURRENT_FUNCTION_NAME);
};
