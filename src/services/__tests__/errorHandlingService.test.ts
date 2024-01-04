import type { Request, Response } from "express";
// import { CustomLogger } from "@/services/LoggerService";
import {
    dbRecordNotFoundErrorHandle,
    errorResponseHandler,
    internalServerErrorHandle,
    multipleActiveUsersErrorHandle,
    tokenNotFoundErrorHandle,
} from "@/services/errorHandlingService";
import { PROCESS_FAILURE, UNEXPECTED_ERROR } from "@/consts/logConsts";
import {
    basicHttpResponce,
    internalServerErr,
} from "@/services/utilResponseService";
import {
    DbRecordNotFoundError,
    MultipleActiveUserError,
    TokenNotFoundError,
} from "../prismaService";

jest.mock("@/services/utilResponseService", () => ({
    ...jest.requireActual("@/services/utilResponseService"),
    basicHttpResponce: jest.fn(),
    internalServerErr: jest.fn(),
}));

// errorResponseHandlerのためにmock化
// 各単体テストの時はmockを無効にする
jest.mock("@/services/errorHandlingService", () => ({
    ...jest.requireActual("@/services/errorHandlingService"),
    dbRecordNotFoundErrorHandle: jest.fn(),
    multipleActiveUsersErrorHandle: jest.fn(),
    tokenNotFoundErrorHandle: jest.fn(),
    internalServerErrorHandle: jest.fn(),
}));

// jest.mock("@/services/LoggerService");
// const MockCustomLogger: jest.Mock = CustomLogger as unknown as jest.Mock;
// MockCustomLogger.mockImplementation(() => {
//     return {
//         constructor: jest.fn(),
//         error: jest.fn(),
//     };
// });

describe("internalServerErrorHandleのテスト", () => {
    const mockReq: Partial<Request> = {
        ip: "mock-ip",
        method: "mock-method",
        path: "mock-path",
        body: "mock-body",
    };
    const mockRes: Partial<Response> = {};

    let unmockInternalServerErrorHandle: typeof internalServerErrorHandle;
    beforeEach(() => {
        // mock化を解除して再度読み込み
        jest.unmock("@/services/errorHandlingService");
        const {
            internalServerErrorHandle,
        } = require("@/services/errorHandlingService");

        unmockInternalServerErrorHandle = internalServerErrorHandle;

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Errorインスタンスの処理", () => {
        // mockの用意
        const errorMsg = "Error instance";
        const error = new Error(errorMsg);
        const mockUserId = 10;
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        unmockInternalServerErrorHandle(
            error,
            mockUserId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        // NOTE: mock化してない。テストデータのままログに記録される。
        // FIXME: mock化したい。現在のコメントを有効化しても、expectで実行が確認できない。ï
        // const expectLogMsg = PROCESS_FAILURE.message(funcName);
        // const expectLogBody = {
        //     mockUserId,
        //     ...mockReq,
        //     errorMsg,
        // };
        // const logger = new CustomLogger();
        // expect(logger.error).toHaveBeenCalledWith(expectLogMsg, expectLogBody);
        expect(internalServerErr).toHaveBeenCalledWith(mockRes, error);
    });

    test("Errorインスタンス以外のエラー", () => {
        // mockの用意
        const error = "Error instance";
        const mockUserId = 10;
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        unmockInternalServerErrorHandle(
            error,
            mockUserId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        // NOTE: mock化してない。テストデータのままログに記録される。
        // FIXME: mock化したい。現在のコメントを有効化しても、expectで実行が確認できない。ï
        // const expectLogMsg = PROCESS_FAILURE.message(funcName);
        // const expectLogBody = {
        //     ...mockReq,
        //     responseMsg: UNEXPECTED_ERROR.message,
        // };
        // const logger = new CustomLogger();
        // expect(logger.error).toHaveBeenCalledWith(expectLogMsg, expectLogBody);
        expect(internalServerErr).toHaveBeenCalledWith(mockRes, error);
    });
});

describe("dbRecordNotFoundErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let unmockDbRecordNotFoundErrorHandle: typeof dbRecordNotFoundErrorHandle;
    beforeEach(() => {
        // mock化を解除して再度読み込み
        jest.unmock("@/services/errorHandlingService");
        const {
            dbRecordNotFoundErrorHandle,
        } = require("@/services/errorHandlingService");
        unmockDbRecordNotFoundErrorHandle = dbRecordNotFoundErrorHandle;

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
        const errMsg = "DbRecordNotFoundError instance";
        const error = new DbRecordNotFoundError(errMsg);
        const funcName = "internalServerErrorHandleのテスト";

        // テスト対象実行
        unmockDbRecordNotFoundErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        // FIXME: loggerもmock化したい。
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errMsg
        );
    });
});

describe("multipleActiveUsersErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let unmockMultipleActiveUsersErrorHandle: typeof multipleActiveUsersErrorHandle;
    beforeEach(() => {
        // mock化を解除して再度読み込み
        jest.unmock("@/services/errorHandlingService");
        const {
            multipleActiveUsersErrorHandle,
        } = require("@/services/errorHandlingService");
        unmockMultipleActiveUsersErrorHandle = multipleActiveUsersErrorHandle;

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
        const errMsg = "multipleActiveUsersErrorHandle instance";
        const error = new MultipleActiveUserError(errMsg);
        const funcName = "multipleActiveUsersErrorHandleのテスト";

        // テスト対象実行
        unmockMultipleActiveUsersErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        // FIXME: loggerもmock化したい。
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errMsg
        );
    });
});

describe("tokenNotFoundErrorHandleのテスト", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let unmockTokenNotFoundErrorHandle: typeof tokenNotFoundErrorHandle;
    beforeEach(() => {
        // mock化を解除して再度読み込み
        jest.unmock("@/services/errorHandlingService");
        const {
            tokenNotFoundErrorHandle,
        } = require("@/services/errorHandlingService");
        unmockTokenNotFoundErrorHandle = tokenNotFoundErrorHandle;

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
        const errMsg = "tokenNotFoundErrorHandle instance";
        const error = new TokenNotFoundError(errMsg);
        const funcName = "tokenNotFoundErrorHandleのテスト";

        // テスト対象実行
        unmockTokenNotFoundErrorHandle(
            error,
            userId,
            mockReq as Request,
            mockRes as Response,
            funcName
        );

        // FIXME: loggerもmock化したい。
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            errMsg
        );
    });
});

describe("errorResponseHandlerのテスト", () => {
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

    test("DbRecordNotFoundErrorインスタンスの処理", () => {
        errorResponseHandler(
            new DbRecordNotFoundError(),
            10,
            mockReq as Request,
            mockRes as Response,
            "hoge"
        );

        expect(dbRecordNotFoundErrorHandle).toHaveBeenCalled();
    });
});
