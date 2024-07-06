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
import { RECORD_DAILY_REPORT } from "@/consts/responseMessages";
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
const CURRENT_FUNCTION_NAME = "registDailyReport";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = undefined;
export type VerifiedResBodyType = BasicResponceType & {
  data: Prisma.Daily_ReportGetPayload<{
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
};

type VerifiedReqBodyType = {
  date: Date | undefined;
  temp: number | undefined;
  weight: number | undefined;
  stomachach:
    | (typeof DAILY_REPORT_STOMACHACHE)[keyof typeof DAILY_REPORT_STOMACHACHE]
    | undefined;
  condition:
    | (typeof DAILY_REPORT_CONDITION)[keyof typeof DAILY_REPORT_CONDITION]
    | undefined;
  arthritis:
    | (typeof DAILY_REPORT_ARTHRITIS)[keyof typeof DAILY_REPORT_ARTHRITIS]
    | undefined;
  skinLesitions:
    | (typeof DAILY_REPORT_SKIN_LESIONS)[keyof typeof DAILY_REPORT_SKIN_LESIONS]
    | undefined;
  ocularLesitions:
    | (typeof DAILY_REPORT_OCULAR_LESIONS)[keyof typeof DAILY_REPORT_OCULAR_LESIONS]
    | undefined;
  fistulaAnorectalLesitions:
    | (typeof DAILY_REPORT_ANORECTALLESITIONS.fistula)[keyof typeof DAILY_REPORT_ANORECTALLESITIONS.fistula]
    | undefined;
  othersAnorectalLesitions:
    | (typeof DAILY_REPORT_ANORECTALLESITIONS.others)[keyof typeof DAILY_REPORT_ANORECTALLESITIONS.others]
    | undefined;
  abdominal:
    | (typeof DAILY_REPORT_ABDOMINAL)[keyof typeof DAILY_REPORT_ABDOMINAL]
    | undefined;
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

export const createDailyReport = async (
  userId: number,
  insertData: {
    date: Date;
    temp: VerifiedReqBodyType["temp"];
    weight: VerifiedReqBodyType["weight"];
    stomachach: VerifiedReqBodyType["stomachach"];
    condition: VerifiedReqBodyType["condition"];
    arthritis: VerifiedReqBodyType["arthritis"];
    skinLesitions: VerifiedReqBodyType["skinLesitions"];
    ocularLesitions: VerifiedReqBodyType["ocularLesitions"];
    fistulaAnorectalLesitions: VerifiedReqBodyType["fistulaAnorectalLesitions"];
    othersAnorectalLesitions: VerifiedReqBodyType["othersAnorectalLesitions"];
    abdominal: VerifiedReqBodyType["abdominal"];
  },
) => {
  const createdDailyReport = await customizedPrisma.daily_Report.create({
    data: {
      userId,
      day: insertData.date,
      Temp: {
        create: {
          result: insertData.temp,
        },
      },
      Weight: {
        create: {
          result: insertData.weight,
        },
      },
      Stomachache:
        insertData.stomachach !== undefined
          ? {
              create: {
                stomachache_Scale_TypesId: insertData.stomachach,
              },
            }
          : undefined,
      Condition:
        insertData.condition !== undefined
          ? {
              create: {
                condition_Scale_TypesId: insertData.condition,
              },
            }
          : undefined,
      Arthritis: {
        create: {
          result: insertData.arthritis,
        },
      },
      Skin_Lesions: {
        create: {
          result: insertData.skinLesitions,
        },
      },
      Ocular_Lesitions: {
        create: {
          result: insertData.ocularLesitions,
        },
      },
      Anorectal_Lesitions: {
        create: {
          fistula: insertData.fistulaAnorectalLesitions,
          others: insertData.othersAnorectalLesitions,
        },
      },
      Abdominal:
        insertData.abdominal !== undefined
          ? {
              create: {
                abdominal_Scale_TypesId: insertData.abdominal,
              },
            }
          : undefined,
    },
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

  return createdDailyReport;
};

export const createDailyReportErrorHandle = (
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
  dailyReport: VerifiedResBodyType["data"],
) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = RECORD_DAILY_REPORT.message;
  basicHttpResponceIncludeData(
    res,
    httpStatus,
    responseStatus,
    responseMsg,
    dailyReport,
  );

  // ログを出力
  logResponse(userId, req, httpStatus, responseMsg, CURRENT_FUNCTION_NAME);
};
