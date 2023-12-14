import { customizedPrisma } from "@/services/prismaClients";
import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { Profile } from "@prisma/client";
import {
    DbRecordNotFoundError,
    findUniqueProfileAbsoluteExist,
} from "@/services/prismaService/index";

const mockPrisma = {
    profile: {
        findUnique: jest.fn(),
    },
} as unknown as jest.MockedObject<typeof customizedPrisma>;

describe("findUniqueBowelMovementAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("プロフィールが存在する場合、データを返す", async () => {
        const mockProfile: Profile = {
            sex: 1,
            height: 150,
            birthday: new Date("2023-09-05T10:00:00Z"),
            id: 1,
            userId: 2,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

        const result = await findUniqueProfileAbsoluteExist(
            { id: 1 },
            mockPrisma
        );
        expect(result).toEqual(mockProfile);
    });

    test("プロフィールが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        mockPrisma.profile.findUnique.mockResolvedValue(null);

        await expect(
            findUniqueProfileAbsoluteExist({ id: 1 }, mockPrisma)
        ).rejects.toThrow(
            new DbRecordNotFoundError("プロフィールが見つかりません。")
        );
    });
});
