import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Daily_Report, Daily_report_Weight, User } from "@prisma/client";
import {
    DbRecordNotFoundError,
    findUniqueUserWeightAbsoluteExist,
} from "@/services/prismaService/index";

// テスト用PrismaClient作成
const jestPrismaClient = jestPrisma.client;

describe("findUniqueUserWeightAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("体温が存在する場合、データを返す", async () => {
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
        const mockDailyReportWeight: Daily_report_Weight = {
            result: 55.5,
            id: 1,
            dailyReportId: 1,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        // テストデータをDBに格納
        await jestPrismaClient.user.create({
            data: mockUser,
        });
        await jestPrismaClient.daily_Report.create({
            data: mockDailyReport,
        });
        await jestPrismaClient.daily_report_Weight.create({
            data: mockDailyReportWeight,
        });

        // テスト実行
        const result = await findUniqueUserWeightAbsoluteExist(
            { id: 1 },
            jestPrismaClient
        );
        expect(result).toEqual(mockDailyReportWeight);
    });

    test("体温が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        await expect(
            findUniqueUserWeightAbsoluteExist({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("体重記録が見つかりません。")
        );
    });
});
