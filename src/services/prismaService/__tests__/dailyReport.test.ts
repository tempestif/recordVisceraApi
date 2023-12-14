import { customizedPrisma } from "@/services/prismaClients";
import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";import { Daily_Report } from "@prisma/client";
import { findUniqueDailyReportAbsoluteExist } from "../dailyReports";
import { DbRecordNotFoundError } from "..";

const mockPrisma = {
    daily_Report: {
        findUnique: jest.fn(),
    },
} as unknown as jest.MockedObject<typeof customizedPrisma>;

describe("findUniqueDailyReportAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("日時記録が存在する場合、データを返す", async () => {
        const mockDailyReport: Daily_Report = {
            id: 1,
            userId: 2,
            day: new Date("2022-12-20T00:00:00.000Z"),
            time: new Date("1970-01-01T09:50:00.000Z"),
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        mockPrisma.daily_Report.findUnique.mockResolvedValue(mockDailyReport);

        const result = await findUniqueDailyReportAbsoluteExist(
            { id: 1 },
            mockPrisma
        );
        expect(result).toEqual(mockDailyReport);
    });

    test("日時記録が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        mockPrisma.daily_Report.findUnique.mockResolvedValue(null);

        await expect(
            findUniqueDailyReportAbsoluteExist({ id: 1 }, mockPrisma)
        ).rejects.toThrow(
            new DbRecordNotFoundError("今日の体調が見つかりません。")
        );
    });
});
