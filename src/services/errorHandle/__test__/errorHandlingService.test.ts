import type { Request, Response } from "express";
import { logError } from "@/services/logger/loggerService";
import { UNEXPECTED_ERROR } from "@/consts/logConsts";
import {
    badRequestErrorHandle,
    dbRecordNotFoundErrorHandle,
    internalServerErrorHandle,
    multipleActiveUsersErrorHandle,
    tokenNotFoundErrorHandle,
} from "@/services/errorHandle/errorHandlingService";
import {
    basicHttpResponce,
    internalServerErr,
} from "@/services/utilResponseService";
import {
    BadRequestError,
    DbRecordNotFoundError,
    MultipleActiveUserError,
    TokenNotFoundError,
} from "@/services/prismaService";

jest.mock("@/services/utilResponseService", () => ({
    ...jest.requireActual("@/services/utilResponseService"),
    basicHttpResponce: jest.fn(),
    internalServerErr: jest.fn(),
}));
jest.mock("@/services/logger/loggerService", () => ({
    ...jest.requireActual("@/services/logger/loggerService"),
    logError: jest.fn(),
}));

describe("internalServerErrorHandleのテスト", () => {
    const mockReq: Partial<Request> = {
        ip: "mock-ip",
        method: "mock-method",
        path: "mock-path",
        body: "mock-body",
    };
    const mockRes: Partial<Response> = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Errorインスタンスの処理", () => {
        // mockの用意
        const errorMassage = "Error instance";
        const error = new Error(errorMassage);
        const mockUserId = 10;
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        internalServerErrorHandle(
            error,
            mockUserId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        const HttpStatus = 500;
        expect(logError).toHaveBeenCalledWith(
            mockUserId,
            mockReq,
            HttpStatus,
            funcName,
            errorMassage
        );
        expect(internalServerErr).toHaveBeenCalledWith(mockRes, error);
    });

    test("Errorインスタンス以外のエラー", () => {
        // mockの用意
        const error = "Error instance";
        const mockUserId = 10;
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        internalServerErrorHandle(
            error,
            mockUserId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        const HttpStatus = 500;
        expect(logError).toHaveBeenCalledWith(
            mockUserId,
            mockReq,
            HttpStatus,
            funcName,
            UNEXPECTED_ERROR.message
        );
        expect(internalServerErr).toHaveBeenCalledWith(mockRes, error);
    });
});

describe("dbRecordNotFoundErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: "mock-body",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        // テストデータ
        const userId = 10;
        const HttpStatus = 401;
        const responseStatus = false;
        const errorMassage = "DbRecordNotFoundError instance";
        const error = new DbRecordNotFoundError(errorMassage);
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        dbRecordNotFoundErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        expect(logError).toHaveBeenCalledWith(
            userId,
            mockReq,
            HttpStatus,
            funcName,
            errorMassage
        );
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errorMassage
        );
    });
});

describe("multipleActiveUsersErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: "mock-body",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        // テストデータ
        const userId = 10;
        const HttpStatus = 500;
        const responseStatus = false;
        const errorMassage = "multipleActiveUsersErrorHandle instance";
        const error = new MultipleActiveUserError(errorMassage);
        const funcName = "multipleActiveUsersErrorHandleのテスト";

        // テスト対象実行
        multipleActiveUsersErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        expect(logError).toHaveBeenCalledWith(
            userId,
            mockReq,
            HttpStatus,
            funcName,
            errorMassage
        );
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errorMassage
        );
    });
});

describe("tokenNotFoundErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: "mock-body",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        // テストデータ
        const userId = 10;
        const HttpStatus = 400;
        const responseStatus = false;
        const errorMassage = "tokenNotFoundErrorHandle instance";
        const error = new TokenNotFoundError(errorMassage);
        const funcName = "tokenNotFoundErrorHandleのテスト";

        // テスト対象実行
        tokenNotFoundErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        expect(logError).toHaveBeenCalledWith(
            userId,
            mockReq,
            HttpStatus,
            funcName,
            errorMassage
        );
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errorMassage
        );
    });
});

describe("badRequestErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: "mock-body",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        // テストデータ
        const userId = 10;
        const errorMassage = "badRequestErrorHandle instance";
        const error = new BadRequestError(errorMassage);
        const funcName = "badRequestErrorHandleのテスト";

        // テスト対象実行
        badRequestErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        const HttpStatus = 400;
        const responseStatus = false;

        expect(logError).toHaveBeenCalledWith(
            userId,
            mockReq,
            HttpStatus,
            funcName,
            errorMassage
        );
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errorMassage
        );
    });
});
