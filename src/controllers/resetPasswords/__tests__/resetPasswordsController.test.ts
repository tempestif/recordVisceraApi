import { Request, Response } from "express";
import {
    requestResettingPassword,
    sendMailForResetPasswordVerify,
} from "@/controllers/resetPasswords/resetPasswordsController";
import { findActivedUser } from "@/services/prismaService";
import { customizedPrisma } from "@/services/prismaClients";
import { randomBytes } from "crypto";
import { logError } from "@/services/logger/loggerService";
import { basicHttpResponce } from "@/services/utilResponseService";
import { UNSPECIFIED_USER_ID } from "@/consts/logConsts";
import fs from "fs";

jest.mock("@/services/prismaService", () => ({
    ...jest.requireActual("@/services/prismaService"),
    findActivedUser: jest.fn().mockImplementation(() => undefined),
}));
jest.mock("crypto", () => ({
    randomBytes: jest.fn().mockImplementation(() => ({
        toString: jest.fn(),
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
        const resetPasswordsController = require("@/controllers/resetPasswords/resetPasswordsController");
        const spySendMailForResetPasswordVerify = jest.spyOn(
            resetPasswordsController,
            "sendMailForResetPasswordVerify"
        );

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
        // NOTE: randomBytesのmock関数に実行の形跡がない
        expect(randomBytes).toHaveBeenCalledWith(32);
        const randomBytesInstance = (randomBytes as jest.Mock).mock.results[0]
            .value;
        expect(randomBytesInstance.toString).toHaveBeenCalledWith("hex");

        // const customizedPrismaInstance = (customizedPrisma as jest.Mock)
        expect(customizedPrisma).toBe("hoge");
        expect(spySendMailForResetPasswordVerify).toHaveBeenCalledWith(
            email,
            `${process.env.BASE_URL}/reset-password/1/execute/mock-hash`
        );
        const HttpStatus = 201;
        const responseStatus = true;
        const responseMsg =
            "パスワードリセットのためのメールが送信されました。";
        const funcName = "requestResettingPassword";
        expect(logError).toHaveBeenCalledWith(
            UNSPECIFIED_USER_ID.message,
            mockReq,
            HttpStatus,
            funcName,
            responseMsg
        );
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            HttpStatus,
            responseStatus,
            responseMsg
        );
    });
    // test("emailがない");
    // test("userが取得できない");
});
