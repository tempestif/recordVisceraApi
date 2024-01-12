import type { Request, Response } from "express";
import { UNSPECIFIED_USER_ID_TYPE } from "@/consts/logConsts";
import {
    BadRequestError,
    DbRecordNotFoundError,
    MultipleActiveUserError,
    TokenNotFoundError,
} from "@/services/prismaService";
import {
    dbRecordNotFoundErrorHandle,
    multipleActiveUsersErrorHandle,
    tokenNotFoundErrorHandle,
    internalServerErrorHandle,
    badRequestErrorHandle,
} from "@/services/errorHandle/errorHandlingService";

/**
 * エラーハンドラー
 * 各エラーハンドルをここに集約
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const errorResponseHandler = (
    e: unknown,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    if (e instanceof DbRecordNotFoundError) {
        dbRecordNotFoundErrorHandle(e, userId, req, res, funcName);
    } else if (e instanceof MultipleActiveUserError) {
        multipleActiveUsersErrorHandle(e, userId, req, res, funcName);
    } else if (e instanceof TokenNotFoundError) {
        tokenNotFoundErrorHandle(e, userId, req, res, funcName);
    } else if (e instanceof BadRequestError) {
        badRequestErrorHandle(e, userId, req, res, funcName);
    } else {
        internalServerErrorHandle(e, userId, req, res, funcName);
    }
};
