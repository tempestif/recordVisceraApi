import type { Request, Response } from "express";
import { customizedPrisma } from "@/services/prismaClients";
import { logResponse } from "@/services/logger/loggerService";
import { basicHttpResponce } from "@/services/utilResponseService";
import { registUser } from "../accountController";
import { randomBytes } from "crypto";
import { sendMailForEmailVerify } from "@/services/prismaService/account";
import { errorResponseHandler } from "@/services/errorHandle";
jest.mock("@/services/prismaService", () => ({
    ...jest.requireActual("@/services/prismaService"),
    findUniqueUserAbsoluteExist: jest.fn(),
}));
jest.mock("@/services/utilResponseService", () => ({
    ...jest.requireActual("@/services/utilResponseService"),
    basicHttpResponce: jest.fn(),
}));
jest.mock("@/services/logger/loggerService", () => ({
    ...jest.requireActual("@/services/logger/loggerService"),
    logError: jest.fn(),
    logResponse: jest.fn(),
    maskConfInfoInReqBody: jest.fn().mockImplementation(() => ({
        ip: "mock-ip",
        method: "mock-method",
        path: "mock-path",
        body: {
            userId: "10",
            date: "2023-10-13T17:40:33.000Z",
            email: "testmail@test",
            password: "masked-password",
            name: "hoge",
        },
    })),
}));
jest.mock("@/services/prismaClients", () => ({
    customizedPrisma: {
        user: {
            findMany: jest.fn().mockImplementation(() => []),
            create: jest.fn().mockImplementation(() => ({
                id: 10,
                day: new Date("2023-10-13T17:40:33.000Z"),
                time: new Date("2023-10-13T17:40:33.000Z"),
                email: "testmail@test",
                password: "password",
                name: "hoge",
                verifyEmailHash: "mock-hash",
                passResetHash: null,
                verified: 1,
                loginStatus: 1,
                createdAt: new Date("2023-11-01T07:01:13.000Z"),
                updatedAt: new Date("2023-11-11T07:01:13.000Z"),
            })),
        },
        profile: {
            create: jest.fn(),
        },
    },
}));
jest.mock("@/services/errorHandle", () => ({
    ...jest.requireActual("@/services/errorHandle"),
    errorResponseHandler: jest.fn(),
}));
jest.mock("crypto", () => ({
    randomBytes: jest.fn().mockImplementation(() => ({
        toString: jest.fn().mockImplementation(() => "mock-hash"),
    })),
}));
jest.mock("@/services/prismaService/account", () => ({
    sendMailForEmailVerify: jest.fn(),
}));

describe("registUserのテスト", () => {
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
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                userId: "10",
                date: "2023-10-13T17:40:33.000Z",
                email: "testmail@test",
                password: "password",
                name: "hoge",
            },
        };

        // テスト対象実行
        await registUser(mockReq as Request, mockRes as Response, next);

        // 確認
        const randomBytesInstance = (randomBytes as jest.Mock).mock.results[0]
            .value;
        expect(randomBytesInstance.toString).toHaveBeenCalledWith("hex");

        const customizedPrismaUserCreateInstance = customizedPrisma.user
            .create as jest.Mock;
        expect(customizedPrismaUserCreateInstance).toHaveBeenCalledWith({
            data: {
                email: "testmail@test",
                password: "password",
                name: "hoge",
                verifyEmailHash: "mock-hash",
            },
        });

        const customizedPrismaProfileCreateInstance = customizedPrisma.profile
            .create as jest.Mock;
        expect(customizedPrismaProfileCreateInstance).toHaveBeenCalledWith({
            data: {
                userId: 10,
            },
        });

        expect(sendMailForEmailVerify).toHaveBeenCalledWith(
            "testmail@test",
            `${process.env.BASE_URL}/users/10/verify/mock-hash`
        );

        const httpStatus = 201;
        const responseStatus = true;
        const responseMsg = "ユーザー認証のためのメールが送信されました。";
        expect(basicHttpResponce).toHaveBeenCalledWith(
            mockRes,
            httpStatus,
            responseStatus,
            responseMsg
        );

        expect(logResponse).toHaveBeenCalledWith(
            "unspecified",
            mockReq,
            httpStatus,
            responseMsg,
            "registUser"
        );
    });
});
