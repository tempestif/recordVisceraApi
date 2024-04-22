import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import {
  EDIT_BOWEL_MOVEMENT,
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
import { Request, Response } from "express";

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "editBowelMovement";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = {
  /** 編集対象の排便記録のid */
  id: number;
};
type VerifiedResBodyType = BasicResponceType & {
  data: Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["update"]["result"];
};
type VerifiedReqBodyType = {
  date: Date | undefined;
  blood: number | undefined;
  drainage: number | undefined;
  note: string | undefined;
  bristolStoolScale: number | undefined;
};
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

export const updateBowelMovement = async (
  id: number,
  userId: number,
  body: VerifiedReqBodyType,
) => {
  // userIdの本人確認
  const bowelMoventData =
    await customizedPrisma.bowel_Movement.findUniqueOrThrow({ where: { id } });
  if (bowelMoventData.userId !== userId) {
    // userIdが一致しなかったらForbiddenErrorを投げる
    throw new AccessForbiddenError(
      ERROR_BOWEL_MOVEMENT_ACCESS_FORBIDDEN.message,
    );
  }

  // 編集処理
  const data = body.date ? { ...body, day: body.date } : body;
  const newBowelMovement = await customizedPrisma.bowel_Movement.update({
    where: { id },
    data,
  });
  return newBowelMovement;
};

export const updateBowelMovementErrorHandle = (
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
  newBowelMovement: Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["update"]["result"],
) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = EDIT_BOWEL_MOVEMENT.message;
  basicHttpResponceIncludeData(
    res,
    httpStatus,
    responseStatus,
    responseMsg,
    newBowelMovement,
  );

  // ログを出力
  logResponse(userId, req, httpStatus, responseMsg, CURRENT_FUNCTION_NAME);
};
