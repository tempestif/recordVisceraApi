import { DEFAULT_DATA_INFO } from "@/consts/db";
import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts";
import {
    DELETE_TEMP,
    EDIT_TEMP,
    READ_TEMP,
    RECORD_TEMP,
    TEMP_ACCESS_FORBIDDEN,
} from "@/consts/responseConsts";
import {
    CustomLogger,
    LoggingObjType,
    maskConfInfoInReqBody,
} from "@/services/LoggerService";
import {
    FilterOptionsType,
    createFilterForPrisma,
    createSortsForPrisma,
} from "@/services/dataTransferService";
import { errorResponseHandler } from "@/services/errorHandle";
import { customizedPrisma } from "@/services/prismaClients";
import {
    findUniqueUserTempAbsoluteExist,
    findUniqueDailyReportAbsoluteExist,
} from "@/services/prismaService";
import {
    basicHttpResponce,
    basicHttpResponceIncludeData,
} from "@/services/utilResponseService";
import type { Request, Response, NextFunction } from "express";
const logger = new CustomLogger();

// TODO: このコントローラ自体は廃止。dailyReportControllerに移行する。

/**
 * 新たな体温記録を作成する
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, temp, date
 * @param res
 * @param next
 * @returns
 */
export const registTemp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId, temp } = req.body;

    // logのために関数名を取得
    const currentFuncName = registTemp.name;
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // userIdから今日の体調を取得
        // FIXME: 「今日」を判別してdailyReportを取得する必要がある。これではuserに紐づくdailyReportが取れてるだけ
        // 多分、findOrCreateにするべきな気がする。
        const whereByUserId = { id: userId };
        const dailyReport = await findUniqueDailyReportAbsoluteExist(
            whereByUserId,
            customizedPrisma
        );

        // 体温を追加
        const tempData = await customizedPrisma.daily_report_Temp.create({
            data: {
                dailyReportId: dailyReport.id,
                result: temp,
            },
        });

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = RECORD_TEMP.message;
        basicHttpResponceIncludeData(
            res,
            HttpStatus,
            responseStatus,
            responseMsg,
            tempData
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
 * 体温のリストを取得
 * クエリで条件を指定
 * sort: 表示順 指定が早い順にandで並び変える
 * fields: 返却されるフィールド 指定されたフィールドのみ返却する。指定がない場合は全部返す
 * limit: 返却データ上限
 * offset: 返却データ開始位置
 * フィールド名: 値でフィルターを行う 一致する値のデータを返却
 * @param req
 * @param res
 * @param next
 */
export const readTemps = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // logのために関数名を取得
    const currentFuncName = readTemps.name;
    // クエリのデータを扱いやすくするための型を定義
    type Query = {
        sort: string | undefined;
        fields: string | undefined;
        limit: string | undefined;
        offset: string | undefined;
    };
    // フィルター以外の条件を取得
    const { sort, fields, limit, offset } = req.query as Query;

    // bodyからuserIdを取得
    const userId = req.body.userId;

    // 指定されたソートの内容をprismaに渡せるように成型
    const sorts = createSortsForPrisma(sort);

    //  クエリで指定されたフィルターの内容を連想配列にまとめる
    const { id, temp, createdAt, updatedAt } = req.query;
    const filterOptions: FilterOptionsType = {
        id: {
            data: id,
            constructor: (i) => Number(i),
        },
        temp: {
            data: temp,
            constructor: (i) => Number(i),
        },
        createdAt: {
            data: createdAt,
            constructor: (i) => new Date(i),
        },
        updatedAt: {
            data: updatedAt,
            constructor: (i) => new Date(i),
        },
    };
    // 指定されたフィールドのみのオブジェクトを作成
    const filter = createFilterForPrisma(filterOptions);

    try {
        // userIdからdailyReportIdを取得
        const whereByUserId = { id: userId };
        const dailyReport = await findUniqueDailyReportAbsoluteExist(
            whereByUserId,
            customizedPrisma
        );
        const dailyReportId = dailyReport.id;
        // 体温を取得
        const temps = await customizedPrisma.daily_report_Temp.findMany({
            orderBy: sorts,
            where: {
                dailyReportId,
                ...filter,
            },
            skip: offset ? Number(offset) : DEFAULT_DATA_INFO.offset,
            take: limit ? Number(limit) : DEFAULT_DATA_INFO.limit,
        });

        // NOTE: ひとまずもう一度全検索でallCountを取る。もっといい方法を考える。
        const allCount = await customizedPrisma.daily_report_Temp.count({
            where: { dailyReportId },
        });

        // レスポンス
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = READ_TEMP.message;
        res.status(HttpStatus).json({
            status: responseStatus,
            message: responseMsg,
            allCount: allCount,
            count: temps.length,
            sort: sort ?? "",
            fields: fields ?? "",
            limit: limit ?? "",
            offset: offset ?? "",
            filter: {
                id: id ?? "",
                temp: temp ?? "",
                createdAt: createdAt ?? "",
                updatedAt: updatedAt ?? "",
            },
            temps,
        });

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
        errorResponseHandler(e, userId.message, req, res, currentFuncName);
    }
};

/**
 * 指定した体温の記録を編集する
 * jwtのuserIdと指定した体温記録のuserIdが合致するときのみ編集可能
 * 体温記録は、user_Tempのidをパラメータに挿入し指定する
 * BaseUrl/users/temps/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editTemp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = Number(req.params.id);
    const { userId, temp } = req.body;

    // logのために関数名を取得
    const currentFuncName = editTemp.name;

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id };
        const tempData = await findUniqueUserTempAbsoluteExist(
            whereByTempId,
            customizedPrisma
        );

        // 指定した体温記録がユーザー本人のものか確認
        const dailyReport = await findUniqueDailyReportAbsoluteExist(
            { id: tempData.dailyReportId },
            customizedPrisma
        );
        const isSelfUser = dailyReport.userId === userId;
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403;
            const responseStatus = false;
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message;
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

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
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

            return;
        }

        // 編集するdataを成型
        const data = {
            result: temp,
        };

        // 体温記録を編集
        const newTemp = await customizedPrisma.daily_report_Temp.update({
            where: { id },
            data: data,
        });

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = EDIT_TEMP.message;
        basicHttpResponceIncludeData(
            res,
            HttpStatus,
            responseStatus,
            responseMsg,
            newTemp
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
        errorResponseHandler(e, userId.message, req, res, currentFuncName);
    }
};

/**
 * 指定した体温の記録を削除する
 * jwtのuserIdと指定した体温記録のuserIdが合致するときのみ削除可能
 * 体温記録は、user_Tempのidをパラメータに挿入し指定する
 * BaseUrl/users/temps/edit/:id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteTemp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = Number(req.params.id);
    const { userId } = req.body;

    // logのために関数名を取得
    const currentFuncName = deleteTemp.name;

    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // idから体温記録を取得
        const whereByTempId = { id };
        const tempData = await findUniqueUserTempAbsoluteExist(
            whereByTempId,
            customizedPrisma
        );

        // 指定した体温記録がユーザー本人のものか確認
        const dailyReport = await findUniqueDailyReportAbsoluteExist(
            { id: tempData.dailyReportId },
            customizedPrisma
        );
        const isSelfUser = dailyReport.userId === userId;
        // ユーザー本人のものではない場合、403を返す
        if (!isSelfUser) {
            const HttpStatus = 403;
            const responseStatus = false;
            const responseMsg = TEMP_ACCESS_FORBIDDEN.message;
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

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
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

            return;
        }

        // 体温記録を削除
        const newTemp = await customizedPrisma.daily_report_Temp.delete({
            where: { id },
        });

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = DELETE_TEMP.message;
        basicHttpResponceIncludeData(
            res,
            HttpStatus,
            responseStatus,
            responseMsg,
            newTemp
        );
    } catch (e) {
        errorResponseHandler(e, userId, req, res, currentFuncName);
    }
};
