import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logMessages";
import {
  DELETE_DAILY_REPORT,
  EDIT_DAILY_REPORT,
  ERROR_DAILY_REPORT_ACCESS_FORBIDDEN,
} from "@/consts/responseMessages";
import * as read from "@/services/users/dailyReport/endpoints/read";
import * as regist from "@/services/users/dailyReport/endpoints/regist";
import { updateDailyReport } from "@/services/users/dailyReports";
import { errorResponseHandler } from "@/utils/errorHandle";
import { throwValidationError } from "@/utils/errorHandle/validate";
import { CustomLogger } from "@/utils/logger/loggerClass";
import {
  LoggingObjType,
  maskConfInfoInReqBody,
} from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import {
  basicHttpResponce,
  basicHttpResponceIncludeData,
} from "@/utils/utilResponse";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
const logger = new CustomLogger();

/**
 * 今日の体調を作成
 * 紐づくテーブルの情報も全て受け取り、必要に応じて値の格納を行う。
 * bodyに入っていないテーブルも作成する
 * 体温
 * 体重
 * 腹痛
 * 体調
 * 関節痛の有無
 * 皮膚病変の有無
 * 眼病変の有無
 * 肛門病変の有無
 * 腹部腫瘤の有無
 * @param req
 * @param res
 * @param next
 */
export const registDailyReport = async (
  req: Request,
  res: regist.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    regist.validationErrorHandle(e, req, res);
    return;
  }
  const VerifiedRequest = req as unknown as regist.VerifiedRequestType;

  const body = VerifiedRequest.body;
  const userId = res.locals.userId;

  // dailyReport追加
  let dailyReport: regist.VerifiedResBodyType["data"];
  try {
    dailyReport = await regist.createDailyReport(userId, {
      date: body.date ?? new Date(),
      temp: body.temp,
      weight: body.weight,
      stomachach: body.stomachach,
      condition: body.condition,
      arthritis: body.arthritis,
      skinLesitions: body.skinLesitions,
      ocularLesitions: body.ocularLesitions,
      fistulaAnorectalLesitions: body.fistulaAnorectalLesitions,
      othersAnorectalLesitions: body.othersAnorectalLesitions,
      abdominal: body.abdominal,
    });
  } catch (e) {
    regist.createDailyReportErrorHandle(e, userId, VerifiedRequest, res);
    return;
  }

  // レスポンスを返却
  regist.sendResponse(userId, VerifiedRequest, res, dailyReport);
};

/**
 * 今日の体調を取得
 * @param req
 * @param res
 * @param next
 */
export const readDailyReport = async (
  req: Request,
  res: read.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    read.validationErrorHandle(e, req, res);
    return;
  }
  const VerifiedRequest = req as unknown as read.VerifiedRequestType;

  const query = VerifiedRequest.query;
  const userId = res.locals.userId;

  // フィルターを成型
  const filters = read.createFilters(query);

  // 今日の体調を取得
  let dailyReports: read.VerifiedResBodyType["data"]["dailyReports"] | null =
    null;
  try {
    dailyReports = await read.getDailyReports(
      userId,
      filters,
      query.fields,
      query.sorts,
      query.offset,
      query.limit,
    );
  } catch (e) {
    read.getDailyReportsErrorHandle(e, userId, req, res);
    return;
  }

  // DBに登録されている全数を取得
  let allCount: number | null = null;
  try {
    allCount = await read.getAllCount(userId);
  } catch (e) {
    read.getAllCountErrorHandle(e, userId, req, res);
    return;
  }

  read.sendResponse(userId, req, res, dailyReports, allCount);
};

/**
 * 今日の体調を編集
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const editDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Number(req.params.id);
  const userId = Number(req.body.userId);
  const {
    date,
    temp,
    weight,
    stomachach,
    condition,
    arthritis,
    skinLesitions,
    ocularLesitions,
    anorectalLesitions,
    anirectalOtherLesitions,
    abdominal,
  } = req.body;

  // logのために関数名を取得
  const currentFuncName = editDailyReport.name;

  // TODO: バリデーション
  try {
    // idから今日の体調を取得
    const whereByDailyReportId = { id };
    console.log(whereByDailyReportId);
    const dailyReport = await customizedPrisma.daily_Report.findUniqueOrThrow({
      where: whereByDailyReportId,
    });
    // 指定した今日の体調がユーザー本人のものか確認
    const isSelfUser = dailyReport.userId === userId;
    // ユーザー本人のものではない場合、403を返す
    if (!isSelfUser) {
      const httpStatus = 403;
      const responseStatus = false;
      const responseMsg = ERROR_DAILY_REPORT_ACCESS_FORBIDDEN.message;
      basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

      // ログを出力
      const logBody: LoggingObjType = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: maskConfInfoInReqBody(req).body,
        status: String(httpStatus),
        responseMsg,
      };
      logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

      return;
    }

    // 編集するdataを成型
    const recordData = {
      date,
      temp,
      weight,
      stomachach,
      condition,
      arthritis,
      skinLesitions,
      ocularLesitions,
      anorectalLesitions,
      anirectalOtherLesitions,
      abdominal,
    };
    // 編集
    const newDailyReport = await updateDailyReport(id, date, recordData);

    // レスポンスを返却
    const httpStatus = 200;
    const responseStatus = true;
    const responseMsg = EDIT_DAILY_REPORT.message;
    basicHttpResponceIncludeData(
      res,
      httpStatus,
      responseStatus,
      responseMsg,
      newDailyReport,
    );

    // ログを出力
    const logBody: LoggingObjType = {
      userId,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: maskConfInfoInReqBody(req).body,
      status: String(httpStatus),
      responseMsg,
    };
    logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
  } catch (e) {
    errorResponseHandler(e, userId, req, res, currentFuncName);
  }
};

/**
 * 今日の体調を削除
 * jwtのuserIdと指定した今日の体調のuserIdが合致するときのみ削除可能
 * 今日の体調は、daily_reportのidをパラメータに挿入し指定する
 * @param req
 * @param res
 * @param next
 */
export const deleteDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // daily_reportのid
  const id = Number(req.params.id);
  const { userId } = req.body;

  // logのために関数名を取得
  const currentFuncName = deleteDailyReport.name;

  // TODO: バリデーション

  try {
    // idから今日の体調を削除
    const whereByDailyReportId = { id };
    const dailyReport = await customizedPrisma.daily_Report.findUniqueOrThrow({
      where: whereByDailyReportId,
    });

    // 指定した今日の体調が本人のものか確認
    const isSelfUser = dailyReport.userId === userId;
    // ユーザー本人のものではない場合、403を返す
    if (!isSelfUser) {
      const httpStatus = 403;
      const responseStatus = false;
      const responseMsg = ERROR_DAILY_REPORT_ACCESS_FORBIDDEN.message;
      basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

      // ログを出力
      const logBody: LoggingObjType = {
        userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: maskConfInfoInReqBody(req).body,
        status: String(httpStatus),
        responseMsg,
      };
      logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

      return;
    }

    // 今日の体調を削除
    const newDailyReport = await customizedPrisma.daily_Report.delete({
      where: whereByDailyReportId,
      include: {
        Daily_report_Temp: true,
        Daily_report_Weight: true,
        Daily_report_Stomachache: true,
        Daily_report_Condition: true,
        Daily_report_Arthritis: true,
        Daily_report_Skin_Lesions: true,
        Daily_report_Ocular_Lesitions: true,
        Daily_report_Anorectal_Lesitions: true,
        Daily_report_Abdominal: true,
      },
    });

    // レスポンスを返却
    const httpStatus = 200;
    const responseStatus = true;
    const responseMsg = DELETE_DAILY_REPORT.message;
    basicHttpResponceIncludeData(
      res,
      httpStatus,
      responseStatus,
      responseMsg,
      newDailyReport,
    );

    // ログを出力
    const logBody: LoggingObjType = {
      userId,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: maskConfInfoInReqBody(req).body,
      status: String(httpStatus),
      responseMsg,
    };
    logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
  } catch (e) {
    errorResponseHandler(e, userId, req, res, currentFuncName);
  }
};
