import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Bowel_Movement, User } from "@prisma/client";
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
        // テストデータ
        const mockUser: User = {
            email: "petaxa@gmail.com",
            name: "petaxa",
            password: "$12365gjoiwe",
            verifyEmailHash: null,
            passResetHash: null,
            loginStatus: 1,
            verified: 1,
            id: 2,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };
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

        // テスト用PrismaClient作成
        const jestPrismaClient = jestPrisma.client;
        // テストデータをDBに格納
        await jestPrismaClient.user.create({
            data: mockUser,
        });
        await jestPrismaClient.bowel_Movement.create({
            data: mockBowelMovement,
        });

        // 想定されるデータ
        const expectBowelMovement: Bowel_Movement = {
            id: 9,
            userId: 2,
            day: new Date("2022-12-20T00:00:00.000Z"),
            time: new Date("1970-01-01T18:50:00.000Z"),
            bristolStoolScale: 3,
            blood: 0,
            drainage: 1,
            note: "note",
            createdAt: new Date("2023-09-05T19:00:00Z"),
            updatedAt: new Date("2023-09-05T20:00:00Z"),
        };

        // テスト実行
        const result = await findUniqueBowelMovementAbsoluteExist(
            { id: 9 },
            jestPrismaClient
        );
        expect(result).toEqual(expectBowelMovement);
    });

    test("排便記録が存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        // テスト用PrismaClient作成
        const jestPrismaClient = jestPrisma.client;

        // テスト実行
        await expect(
            findUniqueBowelMovementAbsoluteExist({ id: 9 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("排便記録が見つかりません。")
        );
    });
});
