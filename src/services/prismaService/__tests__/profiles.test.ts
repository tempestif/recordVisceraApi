import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Profile, User } from "@prisma/client";
import {
    DbRecordNotFoundError,
    findUniqueProfileAbsoluteExist,
} from "@/services/prismaService/index";

// テスト用PrismaClient作成
const jestPrismaClient = jestPrisma.client;

describe("findUniqueProfileAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("プロフィールが存在する場合、データを返す", async () => {
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
        const mockProfile: Profile = {
            sex: 1,
            height: 150,
            birthday: new Date("2023-09-05T10:00:00Z"),
            id: 1,
            userId: 1,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        // テストデータをDBに格納
        await jestPrismaClient.user.create({
            data: mockUser,
        });
        await jestPrismaClient.profile.create({
            data: mockProfile,
        });

        const expectProfile = {
            sex: 1,
            height: 150,
            birthday: new Date("2023-09-05T00:00:00Z"),
            id: 1,
            userId: 1,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        // テスト実行
        const result = await findUniqueProfileAbsoluteExist(
            { id: 1 },
            jestPrismaClient
        );
        expect(result).toEqual(expectProfile);
    });

    test("プロフィールが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        await expect(
            findUniqueProfileAbsoluteExist({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("プロフィールが見つかりません。")
        );
    });
});
