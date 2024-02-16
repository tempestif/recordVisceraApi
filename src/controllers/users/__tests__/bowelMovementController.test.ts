import { Request, Response } from "express";
import { registBowelMovement } from "@/controllers/users/bowelMovementController";
import {
    BadRequestError,
    findUniqueUserAbsoluteExist,
} from "@/services/prismaService";
import { customizedPrisma } from "@/services/prismaClients";
import { basicHttpResponceIncludeData } from "@/services/utilResponseService";
import { logResponse } from "@/services/logger/loggerService";
import { errorResponseHandler } from "@/services/errorHandle";

jest.mock("@/services/prismaService", () => ({
    ...jest.requireActual("@/services/prismaService"),
    findUniqueUserAbsoluteExist: jest.fn(),
}));
jest.mock("@/services/utilResponseService", () => ({
    ...jest.requireActual("@/services/utilResponseService"),
    basicHttpResponceIncludeData: jest.fn(),
}));
jest.mock("@/services/logger/loggerService", () => ({
    ...jest.requireActual("@/services/logger/loggerService"),
    logError: jest.fn(),
    logResponse: jest.fn(),
}));
jest.mock("@/services/prismaClients", () => ({
    customizedPrisma: {
        bowel_Movement: {
            create: jest.fn().mockImplementation(() => ({
                id: 1,
                note: "mock-note",
                day: new Date("2023-10-13T17:40:33.000Z"),
                time: new Date("2023-10-13T17:40:33.000Z"),
                blood: 1,
                drainage: 1,
                bristolStoolScale: 1,
                userId: 10,
                createdAt: new Date("2023-11-01T07:01:13.000Z"),
                updatedAt: new Date("2023-11-11T07:01:13.000Z"),
            })),
        },
    },
}));
jest.mock("@/services/errorHandle", () => ({
    ...jest.requireActual("@/services/errorHandle"),
    errorResponseHandler: jest.fn(),
}));

describe("registBowelMovementのテスト", () => {
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
                bristolStoolScale: "1",
                blood: "1",
                drainage: "1",
                note: "mock-note",
                date: "2023-10-13T17:40:33.000Z",
            },
        };

        // テスト対象実行
        await registBowelMovement(
            mockReq as Request,
            mockRes as Response,
            next
        );

        // 確認
        expect(findUniqueUserAbsoluteExist).toHaveBeenCalledWith(
            { id: 10 },
            customizedPrisma
        );

        const customizedPrismaBowelMovementCreateInstance = customizedPrisma
            .bowel_Movement.create as jest.Mock;
        expect(
            customizedPrismaBowelMovementCreateInstance
        ).toHaveBeenCalledWith({
            data: {
                userId: 10,
                day: new Date("2023-10-13T17:40:33.000Z"),
                time: new Date("2023-10-13T17:40:33.000Z"),
                blood: 1,
                drainage: 1,
                note: "mock-note",
                bristolStoolScale: 1,
            },
        });

        const httpStatus = 200;
        const responseStatus = true;
        const responseMsg = "排便記録を記録しました。";
        expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
            mockRes,
            httpStatus,
            responseStatus,
            responseMsg,
            {
                id: 1,
                note: "mock-note",
                day: new Date("2023-10-13T17:40:33.000Z"),
                time: new Date("2023-10-13T17:40:33.000Z"),
                blood: 1,
                drainage: 1,
                bristolStoolScale: 1,
                userId: 10,
                createdAt: new Date("2023-11-01T07:01:13.000Z"),
                updatedAt: new Date("2023-11-11T07:01:13.000Z"),
            }
        );

        expect(logResponse).toHaveBeenCalledWith(
            10,
            mockReq,
            httpStatus,
            responseMsg,
            "registBowelMovement"
        );
    });
    test("userIdがない", async () => {
        mockReq = {
            ip: "mock-ip",
            method: "mock-method",
            path: "mock-path",
            body: {
                bristolStoolScale: "1",
                blood: "1",
                drainage: "1",
                note: "mock-note",
                date: "2023-10-13T17:40:33.000Z",
            },
        };

        // テスト対象実行
        await registBowelMovement(
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
            "registBowelMovement"
        );
    });
    // test("bristolStoolScaleがない");
    // test("bloodがない");
    // test("drainageがない");
    // test("findUniqueUserAbsoluteExistがエラーを投げる");
});
