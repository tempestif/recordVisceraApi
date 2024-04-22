import { DEFAULT_DATA_INFO } from "@/consts/dbMappings";
import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import { READ_BOWEL_MOVEMENT } from "@/consts/responseMessages/messages/bowelMovement";
import {
  createSelectForPrisma,
  createSortsForPrisma,
} from "@/utils/dataTransfer";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import { BadRequestError } from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { AnyRequest, QueryTypeBasedOnReadRequest } from "@/utils/utilRequest";
import {
  BasicResponceType,
  basicHttpResponceIncludeData,
} from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "readBowelMovements";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = undefined;
type VerifiedResBodyType = BasicResponceType & {
  data: {
    allCount: number;
    count: number;
    sort: (ScalarField | `-${ScalarField}`)[] | null;
    fields: ScalarField[] | null;
    limit: number | null;
    offset: number | null;
    filter: Filters<null>;
    bowelMovements: Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["findMany"]["result"];
  };
};
type VerifiedReqBodyType = undefined;
type ScalarField = keyof typeof Prisma.Bowel_MovementScalarFieldEnum;
type Filters<Falsy> = {
  id: number | Falsy;
  date: Date | Falsy;
  blood: number | Falsy;
  drainage: number | Falsy;
  note: string | Falsy;
  bristolStoolScale: number | Falsy;
  createdAt: Date | Falsy;
  updatedAt: Date | Falsy;
};
type VerifiedReqQueryType = QueryTypeBasedOnReadRequest<
  ScalarField,
  ScalarField | `-${ScalarField}`
> &
  Filters<undefined>;
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

// クエリで受け取りうる値
const filters: (keyof Filters<undefined>)[] = [
  "id",
  "date",
  "blood",
  "drainage",
  "note",
  "bristolStoolScale",
  "createdAt",
  "updatedAt",
];

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

/**
 * 受け取ったqueryに従ってbowelMovementを取得する
 * @param userId
 * @param query
 */
export const getBowelMovements = async (
  userId: number,
  query: VerifiedReqQueryType,
) => {
  // userの有無を確認(見つからなかったらPrismaからエラーがthrowされる)
  await customizedPrisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  // whereを作成
  // userIdとクエリで指定されたパラメータの絞り込みをwhereの形式で整理
  const where = filters.reduce(
    (prevWhere: { [key: string]: string | number | Date }, field) => {
      const filterValue = query[field];
      if (filterValue) {
        prevWhere[field] = filterValue;
      }
      return prevWhere;
    },
    { userId },
  );

  const bowelMovements = await customizedPrisma.bowel_Movement.findMany({
    orderBy: createSortsForPrisma<ScalarField, `-${ScalarField}`>(query.sorts),
    where,
    skip: query.offset ?? DEFAULT_DATA_INFO.offset,
    take: query.limit ?? DEFAULT_DATA_INFO.limit,
    select: createSelectForPrisma(query.fields),
  });

  return bowelMovements;
};

/**
 * getBowelMovementsのエラーハンドル
 * @param e
 * @param userId
 * @param req
 * @param res
 */
export const getBowelMovementsErrorHandle = (
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

/**
 * 同一userIdのbowelMovementの数を計算する
 * @param userId
 * @returns
 */
export const getAllCount = async (userId: number) => {
  // NOTE: もっとパフォーマンスが良い方法がありそう
  const allCount = await customizedPrisma.bowel_Movement.count({
    where: { userId },
  });

  return allCount;
};

/**
 * getAllCountのエラーハンドル
 * @param e
 * @param userId
 * @param req
 * @param res
 */
export const getAllCountErrorHandle = (
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
  bowelMovements: Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["findMany"]["result"],
  allCount: number,
) => {
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = READ_BOWEL_MOVEMENT.message;
  const data: VerifiedResBodyType["data"] = {
    allCount,
    count: bowelMovements.length,
    sort: req.query.sorts ?? null,
    fields: req.query.fields ?? null,
    limit: req.query.limit ?? null,
    offset: req.query.offset ?? null,
    filter: {
      id: req.query.id ?? null,
      date: req.query.date ?? null,
      blood: req.query.blood ?? null,
      drainage: req.query.drainage ?? null,
      note: req.query.note ?? null,
      bristolStoolScale: req.query.bristolStoolScale ?? null,
      createdAt: req.query.createdAt ?? null,
      updatedAt: req.query.updatedAt ?? null,
    },
    bowelMovements,
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
