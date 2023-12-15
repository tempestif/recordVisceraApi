import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Bowel_Movement } from "@prisma/client";
import { findUniqueBowelMovementAbsoluteExist } from "@/services/prismaService/bowelMovements";
import { DbRecordNotFoundError } from "@/services/prismaService/index";
import { customizedPrisma } from "@/services/prismaClients";

describe("findUniqueBowelMovementAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("排便記録が存在する場合、データを返す", async () => {
        const mockBowelMovement: Bowel_Movement = {
            id: 9,
            userId: 2,
            day: new Date("2022-12-20T00:00:00.000Z"),
            time: new Date("1970-01-01T09:50:00.000Z"),
            bristolStoolScale: 3,
            blood: 0,
            drainage: 1,
            note: "note",
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };
        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;
        jestPrismaClient.bowel_Movement.create({
            data: mockBowelMovement,
        });

        const result = await findUniqueBowelMovementAbsoluteExist(
            { id: 9 },
            jestPrismaClient
        );
        expect(result).toEqual(mockBowelMovement);
    });

    test("排便記録が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        mockPrisma.bowel_Movement.findUnique.mockResolvedValue(null);

        await expect(
            findUniqueBowelMovementAbsoluteExist({ id: 9 }, mockPrisma)
        ).rejects.toThrow(
            new DbRecordNotFoundError("排便記録が見つかりません。")
        );
    });
});
