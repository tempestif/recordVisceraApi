import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import { RECORD_BOWEL_MOVEMENT } from "@/consts/responseMessages";
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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "registBowelMovement";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = undefined;
type VerifiedResBodyType = BasicResponceType & {
  data: Prisma.$Bowel_MovementPayload["scalars"];
};
type VerifiedReqBodyType = {
  userId: number;
  bristolStoolScale: number;
  blood: number;
  drainage: number;
  date: Date | undefined;
  note: string | undefined;
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

export const createBowelMovement = async (
  userId: number,
  insertData: {
    date: Date;
    blood: number;
    drainage: number;
    note: string | undefined;
    bristolStoolScale: number;
  },
) => {
  const data = await customizedPrisma.bowel_Movement.create({
    data: {
      userId,
      date: insertData.date,
      day: insertData.date,
      blood: insertData.blood,
      drainage: insertData.drainage,
      note: insertData.note,
      bristolStoolScale: insertData.bristolStoolScale,
    },
  });
  return data;
};

export const createBowelMovementErrorHandle = (
  e: unknown,
  userId: number,
  req: AnyRequest,
  res: Response,
) => {
  if (e instanceof PrismaClientKnownRequestError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

export const sendResponse = (
  userId: number,
  req: AnyRequest,
  res: Response,
  bowelMovementData: Prisma.$Bowel_MovementPayload["scalars"],
) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = RECORD_BOWEL_MOVEMENT.message;
  basicHttpResponceIncludeData(
    res,
    httpStatus,
    responseStatus,
    responseMsg,
    bowelMovementData,
  );

  // ログを出力
  logResponse(userId, req, httpStatus, responseMsg, CURRENT_FUNCTION_NAME);
};
