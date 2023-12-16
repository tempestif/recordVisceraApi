import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Daily_Report, User } from "@prisma/client";
import { findUniqueDailyReportAbsoluteExist } from "../dailyReports";
import { DbRecordNotFoundError } from "..";

describe("findUniqueDailyReportAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("日時記録が存在する場合、データを返す", async () => {
        // テストデータ
        const mockUser: User = {
            email: "petaxa@gmail.com",
            name: "petaxa",
            password: "$12365gjoiwe",
            verifyEmailHash: null,
            passResetHash: null,
            loginStatus: 1,
            verified: 1,
            id: 1,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };
        const mockDailyReport: Daily_Report = {
            id: 1,
            userId: 1,
            day: new Date("2022-12-20T00:00:00.000Z"),
            time: new Date("1970-01-01T09:50:00.000Z"),
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };
        // テスト用PrismaClient作成
        const jestPrismaClient = jestPrisma.client;
        // テストデータをDBに格納
        await jestPrismaClient.user.create({
            data: mockUser,
        });
        await jestPrismaClient.daily_Report.create({
            data: mockDailyReport,
        });

        // 想定されるデータ
        const expectDailyReport: Daily_Report = {
            id: 1,
            userId: 1,
            day: new Date("2022-12-20T00:00:00.000Z"),
            time: new Date("1970-01-01T18:50:00.000Z"),
            createdAt: new Date("2023-09-05T19:00:00Z"),
            updatedAt: new Date("2023-09-05T20:00:00Z"),
        };

        const result = await findUniqueDailyReportAbsoluteExist(
            { id: 1 },
            jestPrismaClient
        );
        expect(result).toEqual(expectDailyReport);
    });

    test("日時記録が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        const jestPrismaClient = jestPrisma.client;

        await expect(
            findUniqueDailyReportAbsoluteExist({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("今日の体調が見つかりません。")
        );
    });
});
