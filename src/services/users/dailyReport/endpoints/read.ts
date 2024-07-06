import { DEFAULT_DATA_INFO } from "@/consts/dbMappings";
import {
  DAILY_REPORT_ABDOMINAL,
  DAILY_REPORT_ANORECTALLESITIONS,
  DAILY_REPORT_ARTHRITIS,
  DAILY_REPORT_CONDITION,
  DAILY_REPORT_OCULAR_LESIONS,
  DAILY_REPORT_SKIN_LESIONS,
  DAILY_REPORT_STOMACHACHE,
} from "@/consts/dbMappings/dailyReport";
import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import { READ_DAILY_REPORT } from "@/consts/responseMessages";
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
import {
  AnyRequest,
  QueryTypeBasedOnReadRequest,
  omitExceptFilters,
} from "@/utils/utilRequest";
import {
  BasicResponceType,
  basicHttpResponceIncludeData,
} from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import $Extensions = runtime.Types.Extensions;

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "readDailyReport";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = undefined;
type ExtArgs = $Extensions.InternalArgs<{
  orderBy: object;
  where: {
    [key: string]: number | Date | undefined;
  };
  skip: number;
  take: number;
  select: {
    [key: string]: true;
  };
  include: {
    Temp: true;
    Weight: true;
    Stomachache: true;
    Condition: true;
    Arthritis: true;
    Skin_Lesions: true;
    Ocular_Lesitions: true;
    Anorectal_Lesitions: true;
    Abdominal: true;
  };
}>;
export type VerifiedResBodyType = BasicResponceType & {
  data: {
    allCount: number;
    count: number;
    sort: (ScalarField | `-${ScalarField}`)[] | null;
    fields: ScalarField[] | null;
    limit: number | null;
    offset: number | null;
    filter: Filters<null>;
    dailyReports: Prisma.TypeMap<ExtArgs>["model"]["Daily_Report"]["operations"]["findMany"]["result"];
  };
};
type VerifiedReqBodyType = undefined;
type ScalarField =
  | keyof typeof Prisma.Daily_ReportScalarFieldEnum
  | "temp"
  | "weight"
  | "stomachach"
  | "condition"
  | "arthritis"
  | "skinLesitions"
  | "ocularLesitions"
  | "fistulaAnorectalLesitions"
  | "othersAnorectalLesitions"
  | "abdominal";
export type Filters<Falsy extends null | undefined | never> = {
  id: number | Falsy;
  date: Date | Falsy;
  temp: number | Falsy;
  weight: number | Falsy;
  stomachach:
    | (typeof DAILY_REPORT_STOMACHACHE)[keyof typeof DAILY_REPORT_STOMACHACHE]
    | Falsy;
  condition:
    | (typeof DAILY_REPORT_CONDITION)[keyof typeof DAILY_REPORT_CONDITION]
    | Falsy;
  arthritis:
    | (typeof DAILY_REPORT_ARTHRITIS)[keyof typeof DAILY_REPORT_ARTHRITIS]
    | Falsy;
  skinLesitions:
    | (typeof DAILY_REPORT_SKIN_LESIONS)[keyof typeof DAILY_REPORT_SKIN_LESIONS]
    | Falsy;
  ocularLesitions:
    | (typeof DAILY_REPORT_OCULAR_LESIONS)[keyof typeof DAILY_REPORT_OCULAR_LESIONS]
    | Falsy;
  fistulaAnorectalLesitions:
    | (typeof DAILY_REPORT_ANORECTALLESITIONS.fistula)[keyof typeof DAILY_REPORT_ANORECTALLESITIONS.fistula]
    | Falsy;
  othersAnorectalLesitions:
    | (typeof DAILY_REPORT_ANORECTALLESITIONS.others)[keyof typeof DAILY_REPORT_ANORECTALLESITIONS.others]
    | Falsy;
  abdominal:
    | (typeof DAILY_REPORT_ABDOMINAL)[keyof typeof DAILY_REPORT_ABDOMINAL]
    | Falsy;
  createdAt: Date | Falsy;
  updatedAt: Date | Falsy;
};
type VerifiedReqQueryType = QueryTypeBasedOnReadRequest<
  ScalarField,
  ScalarField | `-${ScalarField}`,
  Filters<undefined>
>;
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

/**
 * クエリからfilterを作成する
 * @param query
 * @returns
 */
export const createFilters = (query: VerifiedReqQueryType) => {
  return omitExceptFilters(query);
};

/**
 * クエリで指定された条件に合致するdailyReportのリストを取得する
 * @param userId
 * @param query
 * @returns
 */
export const getDailyReports = async (
  userId: number,
  filters: Filters<undefined> | Record<string, never>,
  fields: VerifiedReqQueryType["fields"],
  sorts: VerifiedReqQueryType["sorts"],
  offset: VerifiedReqQueryType["offset"],
  limit: VerifiedReqQueryType["limit"],
) => {
  // whereを作成
  // userIdとクエリで指定されたパラメータの絞り込みをwhereの形式で整理
  const where = { ...filters, userId };

  const dailyReports = await customizedPrisma.daily_Report.findMany({
    orderBy: createSortsForPrisma<ScalarField, `-${ScalarField}`>(sorts),
    where,
    skip: offset ?? DEFAULT_DATA_INFO.offset,
    take: limit ?? DEFAULT_DATA_INFO.limit,
    select: createSelectForPrisma(fields),
    include: {
      Temp: true,
      Weight: true,
      Stomachache: true,
      Condition: true,
      Arthritis: true,
      Skin_Lesions: true,
      Ocular_Lesitions: true,
      Anorectal_Lesitions: true,
      Abdominal: true,
    },
  });

  return dailyReports;
};

/**
 * getDailyReportsのErrorHandle
 * @param e
 * @param userId
 * @param req
 * @param res
 */
export const getDailyReportsErrorHandle = (
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
 * 同一userIdのdailyReportの数を計算する
 * @param userId
 * @returns
 */
export const getAllCount = async (userId: number) => {
  // NOTE: もっとパフォーマンスが良い方法がありそう
  const allCount = await customizedPrisma.daily_Report.count({
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

/**
 * レスポンスを返却
 * @param userId
 * @param req
 * @param res
 * @param dailyReports
 * @param allCount
 */
export const sendResponse = (
  userId: number,
  req: AnyRequest,
  res: Response,
  dailyReports: VerifiedResBodyType["data"]["dailyReports"],
  allCount: number,
) => {
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = READ_DAILY_REPORT.message;
  const data: VerifiedResBodyType["data"] = {
    allCount,
    count: dailyReports.length,
    sort: req.query.sorts ?? null,
    fields: req.query.fields ?? null,
    limit: req.query.limit ?? null,
    offset: req.query.offset ?? null,
    filter: {
      id: req.query.id ?? null,
      date: req.query.date ?? null,
      temp: req.query.temp ?? null,
      weight: req.query.weight ?? null,
      stomachach: req.query.stomachach ?? null,
      condition: req.query.condition ?? null,
      arthritis: req.query.arthritis ?? null,
      skinLesitions: req.query.skinLesitions ?? null,
      ocularLesitions: req.query.ocularLesitions ?? null,
      fistulaAnorectalLesitions: req.query.fistulaAnorectalLesitions ?? null,
      othersAnorectalLesitions: req.query.othersAnorectalLesitions ?? null,
      abdominal: req.query.abdominal ?? null,
      createdAt: req.query.createdAt ?? null,
      updatedAt: req.query.updatedAt ?? null,
    },
    dailyReports,
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
