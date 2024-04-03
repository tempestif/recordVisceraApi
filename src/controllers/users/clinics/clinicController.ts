import { CLINIC_DEFAULT_DATA_INFO } from "@/consts/db/clinic";
import { PROCESS_SUCCESS } from "@/consts/logConsts";
import { READ_CLINIC, RECORD_CLINIC } from "@/consts/responseConsts/clinic";
import { CustomLogger } from "@/utils/logger/loggerClass";
import {
  LoggingObjType,
  maskConfInfoInReqBody,
} from "@/utils/logger/utilLogger";
import {
  createFilterForPrisma,
  createSortsForPrisma,
} from "@/utils/dataTransfer";
import { errorResponseHandler } from "@/utils/errorHandle/index";
import { customizedPrisma } from "@/utils/prismaClients";
import { createClinicReport } from "@/services/users/clinics/clinicService";
import { basicHttpResponceIncludeData } from "@/utils/utilResponse";
import type { Request, Response, NextFunction } from "express";
const logger = new CustomLogger();

export const registClinicReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // logのために関数名を取得
  const currentFuncName = registClinicReport.name;

  // bodyから情報取得
  const { userId, date, checkupBlood, checkupMri, checkupCt, checkupCustom } =
    req.body;
  // TODO: バリデーション
  if (
    typeof checkupBlood !== "boolean" ||
    typeof checkupMri !== "boolean" ||
    typeof checkupCt !== "boolean"
  ) {
    throw Error;
  }

  try {
    // dateをDate型に変換
    let dateForDb;
    if (!date) {
      // dateが指定なしの場合、現在日時を入力
      dateForDb = new Date();
    } else {
      // dateが指定されていた場合、指定のdate
      dateForDb = new Date(date);
    }

    // userId、日付で同日の記録がないことを確認
    const whereByReportIdentifier = {
      report_identifier: { userId, day: dateForDb, time: dateForDb },
    };
    await customizedPrisma.clinic_Report.findUnique({
      where: whereByReportIdentifier,
    });

    const checkups = {
      blood: checkupBlood,
      mri: checkupMri,
      ct: checkupCt,
      custom: checkupCustom,
    };

    // clinic_reportを作る
    const clinicReport = createClinicReport(userId, dateForDb, checkups);

    // レスポンスを返却
    const HttpStatus = 200;
    const responseStatus = true;
    const responseMsg = RECORD_CLINIC.message;
    basicHttpResponceIncludeData(
      res,
      HttpStatus,
      responseStatus,
      responseMsg,
      clinicReport
    );

    // ログを出力
    const logBody: LoggingObjType = {
      userId: userId,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: maskConfInfoInReqBody(req).body,
      status: String(HttpStatus),
      responseMsg,
    };
    logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
  } catch (e) {
    errorResponseHandler(e, userId, req, res, currentFuncName);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const readClinicReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // logのために関数名を取得
  const currentFuncName = readClinicReport.name;

  // クエリのデータを扱いやすくするための型を定義
  type Query = {
    sort: string | undefined;
    fields: string | undefined;
    limit: string | undefined;
    offset: string | undefined;
    id: string | undefined;
    year: string;
    month: string;
    day: string;
    createdAt: string | undefined;
    updatedAt: string | undefined;
  };

  const {
    sort,
    fields,
    limit,
    offset,
    id,
    year,
    month,
    day,
    createdAt,
    updatedAt,
  } = req.query as Query;

  // TODO: バリデーション
  if (!year || !month || !day) {
    // TODO: Errorじゃなくて、ちゃんと考える。
    // 400番台のエラーだと思う。パラメータ不足のやつ
    throw Error;
  }

  // 指定されたソートの内容をprismaに渡せるように成型
  const sorts = createSortsForPrisma(sort);
  // フィールドをfilterするためのオブジェクトを作成
  const filter = createFilterForPrisma({
    id: {
      data: id,
      constructor: (i) => Number(i),
    },
  });

  const userId = req.body.userId;

  try {
    const dateForDb = new Date(`${year}-${month}-${day}`);

    // 通院記録を取得
    // ネストしているテーブルたちをどう取ってくるか考える
    // checkupまではとれるけど、その先が直接触りにいかないと取れない。
    const includeFields = {
      Clinic_Note: true,
      Checkup: true,
    };
    const clinicReports = await customizedPrisma.clinic_Report.findMany({
      where: {
        userId,
        day: dateForDb,
        ...filter,
      },
      orderBy: sorts,
      skip: offset ? Number(offset) : CLINIC_DEFAULT_DATA_INFO.offset,
      take: limit ? Number(limit) : CLINIC_DEFAULT_DATA_INFO.limit,
      include: includeFields,
    });

    // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
    const allCount = await customizedPrisma.daily_Report.count({
      where: {
        userId,
      },
    });

    // レスポンス返却
    const HttpStatus = 200;
    const responseStatus = true;
    const responseMsg = READ_CLINIC.message;
    res.status(HttpStatus).json({
      status: responseStatus,
      message: responseMsg,
      allCount: allCount,
      count: clinicReports.length,
      sort: sort ?? "",
      fields: fields ?? "",
      limit: limit ?? "",
      offset: offset ?? "",
      filter: {
        id: id ?? "",
        createdAt: createdAt ?? "",
        updatedAt: updatedAt ?? "",
      },
      dailyReports: clinicReports,
    });
  } catch (e) {
    errorResponseHandler(e, userId, req, res, currentFuncName);
  }
};
