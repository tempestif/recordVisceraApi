import { customizedPrisma } from "@/services/prismaClients";
import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Daily_report_Temp } from "@prisma/client";
import {
    DbRecordNotFoundError,
    findUniqueUserTempAbsoluteExist,
} from "@/services/prismaService/index";

const mockPrisma = {
    daily_report_Temp: {
        findUnique: jest.fn(),
    },
} as unknown as jest.MockedObject<typeof customizedPrisma>;

describe("findUniqueUserTempAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("体温が存在する場合、データを返す", async () => {
        const mockProfile: Daily_report_Temp = {
            result: 36.5,
            id: 1,
            dailyReportId: 2,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        mockPrisma.daily_report_Temp.findUnique.mockResolvedValue(mockProfile);

        const result = await findUniqueUserTempAbsoluteExist(
            { id: 1 },
            mockPrisma
        );
        expect(result).toEqual(mockProfile);
    });

    test("体温が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        mockPrisma.daily_report_Temp.findUnique.mockResolvedValue(null);

        await expect(
            findUniqueUserTempAbsoluteExist({ id: 1 }, mockPrisma)
        ).rejects.toThrow(new DbRecordNotFoundError("体温が見つかりません。"));
    });
});
