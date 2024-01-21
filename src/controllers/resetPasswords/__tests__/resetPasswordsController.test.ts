import { Request, Response } from "express";
import {
    executeResettingPassword,
    requestResettingPassword,
} from "@/controllers/resetPasswords/resetPasswordsController";
import {
    BadRequestError,
    MultipleActiveUserError,
    TokenNotFoundError,
    findActivedUser,
    findUniqueUserAbsoluteExist,
} from "@/services/prismaService";
import { customizedPrisma } from "@/services/prismaClients";
import { randomBytes } from "crypto";
import { logError, logResponse } from "@/services/logger/loggerService";
import { basicHttpResponce } from "@/services/utilResponseService";
import { UNSPECIFIED_USER_ID } from "@/consts/logConsts";
import { sendMailForResetPasswordVerify } from "@/services/nodemailerService";
import { errorResponseHandler } from "@/services/errorHandle";

jest.mock("@/services/prismaService", () => ({
    ...jest.requireActual("@/services/prismaService"),
    findActivedUser: jest.fn().mockImplementation(() => undefined),
    findUniqueUserAbsoluteExist: jest.fn().mockImplementation(() => undefined),
}));
jest.mock("crypto", () => ({
    randomBytes: jest.fn().mockImplementation(() => ({
        toString: jest.fn().mockImplementation(() => "mock-hash"),
    })),
}));
jest.mock("@/services/prismaClients", () => ({
    customizedPrisma: {
        user: {
            update: jest.fn().mockImplementation(() => ({
                name: "mock-name",
                email: "mock@email",
                password: "mock-password",
                verifyEmailHash: null,
                passResetHash: "mock-hash",
                verified: 1,
                loginStatus: 1,
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            })),
        },
    },
}));
jest.mock("@/services/utilResponseService", () => ({
    ...jest.requireActual("@/services/utilResponseService"),
    basicHttpResponce: jest.fn(),
}));
jest.mock("@/services/logger/loggerService", () => ({
    ...jest.requireActual("@/services/logger/loggerService"),
    logError: jest.fn(),
    logResponse: jest.fn(),
}));
jest.mock("@/services/nodemailerService", () => ({
    ...jest.requireActual("@/services/nodemailerService"),
    sendMailForResetPasswordVerify: jest.fn(),
}));
jest.mock("@/services/errorHandle", () => ({
    ...jest.requireActual("@/services/nodemailerService"),
    errorResponseHandler: jest.fn(),
}));

describe("requestResettingPasswordのテスト", () => {
    let mockReq: Partial<Request>;
    const mockRes: Partial<Response> = {};
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {},
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", async () => {
        // mock化
        const email = "mock@email";
        (findActivedUser as jest.Mock).mockImplementation(() => [
            {
                name: "mock-name",
                email,
                password: "mock-password",
                verifyEmailHash: null,
                passResetHash: null,
                verified: 1,
                loginStatus: 1,
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                email,
            },
        };

        // テスト対象実行
        await requestResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(findActivedUser).toHaveBeenCalledWith(
            { email },
            customizedPrisma
        );

        expect(randomBytes).toHaveBeenCalledWith(32);

        const randomBytesInstance = (randomBytes as jest.Mock).mock.results[0]
            .value;
        expect(randomBytesInstance.toString).toHaveBeenCalledWith("hex");

        const customizedPrismaUserUpdateInstance = customizedPrisma.user
            .update as jest.Mock;
        expect(customizedPrismaUserUpdateInstance).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
            data: {
                passResetHash: "mock-hash",
            },
        });

        expect(sendMailForResetPasswordVerify).toHaveBeenCalledWith(
            email,
            `${process.env.BASE_URL}/reset-password/1/execute/mock-hash`
        );

        const HttpStatus = 201;
        const responseStatus = true;
        const responseMsg =
            "パスワードリセットのためのメールが送信されました。";
        const funcName = "requestResettingPassword";
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            responseMsg
        );

        expect(logResponse).toHaveBeenCalledWith(
            UNSPECIFIED_USER_ID.message,
            mockReq,
            HttpStatus,
            responseMsg,
            funcName
        );
    });
    test("emailがない", async () => {
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {},
        };

        // テスト対象実行
        await requestResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new BadRequestError("不正なリクエストです"),
            "unspecified",
            mockReq,
            mockRes,
            "requestResettingPassword"
        );
    });
    test("userが取得できない", async () => {
        // mock化
        const email = "mock@email";
        (findActivedUser as jest.Mock).mockImplementation(() => []);
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                email,
            },
        };

        // テスト対象実行
        await requestResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new MultipleActiveUserError("登録済みユーザーが複数います"),
            "unspecified",
            mockReq,
            mockRes,
            "requestResettingPassword"
        );
    });
});

describe("executeResettingPasswordのテスト", () => {
    let mockReq: Partial<Request>;
    const mockRes: Partial<Response> = {};
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {},
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: token,
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                token,
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(findUniqueUserAbsoluteExist).toHaveBeenCalledWith(
            { id: 1 },
            customizedPrisma
        );

        const customizedPrismaUserUpdateInstance = customizedPrisma.user
            .update as jest.Mock;
        expect(customizedPrismaUserUpdateInstance).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
            data: {
                passResetHash: "",
                password: newPassword,
            },
        });

        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = "パスワードのリセットが完了しました。";
        const funcName = "executeResettingPassword";
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            responseMsg
        );

        expect(logResponse).toHaveBeenCalledWith(
            "unspecified",
            mockReq,
            HttpStatus,
            responseMsg,
            funcName
        );
    });
    test("idがない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: token,
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                token,
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new BadRequestError("不正なリクエストです"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
    test("tokenがない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: token,
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new BadRequestError("不正なリクエストです"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
    test("newPasswordがない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: token,
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                token,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new BadRequestError("不正なリクエストです"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
    test("userがない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(
            () => undefined
        );
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                token,
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new TokenNotFoundError("トークンが見つかりません。"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
    test("userのpassResetHashがない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: "",
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                token,
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new TokenNotFoundError("トークンが見つかりません。"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
    test("passResetHashとtokenが一致しない", async () => {
        // mock化
        const token = "mock-token";
        const newPassword = "mock-newPassword";
        (findUniqueUserAbsoluteExist as jest.Mock).mockImplementation(() => ({
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: "unmachedToken",
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                id: "1",
                token,
                newPassword,
            },
        };

        // テスト対象実行
        await executeResettingPassword(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(errorResponseHandler).toHaveBeenCalledWith(
            new TokenNotFoundError("トークンが見つかりません。"),
            "unspecified",
            mockReq,
            mockRes,
            "executeResettingPassword"
        );
    });
});
