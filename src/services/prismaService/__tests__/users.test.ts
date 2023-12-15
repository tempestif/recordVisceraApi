import { customizedPrisma } from "@/services/prismaClients";
import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach,
} from "@jest/globals";
import { User } from "@prisma/client";
import {
    DbRecordNotFoundError,
    findActivedUser,
    findUniqueUserAbsoluteExist,
} from "@/services/prismaService/index";
import { USER_LOGIN_STATUS } from "@/consts/db";

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
} as unknown as jest.MockedObject<typeof customizedPrisma>;

describe("findUniqueUserAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("ユーザーが存在する場合、データを返す", async () => {
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

        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;

        await jestPrismaClient.user.create({
            data: mockUser,
        });

        const result = await findUniqueUserAbsoluteExist(
            { id: 1 },
            jestPrismaClient
        );
        expect(result).toEqual(mockUser);
    });

    test("ユーザーが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;

        await expect(
            findUniqueUserAbsoluteExist({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("ユーザーが見つかりません。")
        );
    });
});

describe("findActivedUserの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("退会済み以外のユーザーが存在する場合、データを返す", async () => {
        const mockUsers: User[] = [
            {
                email: "petaxa_one@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.login,
                verified: 1,
                id: 1,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
            {
                email: "petaxa_two@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.logout,
                verified: 1,
                id: 2,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
            {
                email: "petaxa_three@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.deactived,
                verified: 1,
                id: 3,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
        ];
        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;
        await jestPrismaClient.user.createMany({
            data: mockUsers,
        });

        const expectUsers: User[] = [
            {
                email: "petaxa_one@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.login,
                verified: 1,
                id: 1,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
            {
                email: "petaxa_two@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.logout,
                verified: 1,
                id: 2,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
        ];

        const result = await findActivedUser({}, jestPrismaClient);
        expect(result).toEqual(expectUsers);
    });

    test("退会済みユーザーのみの場合、DbRecordNotFoundErrorを投げる", async () => {
        const mockUsers: User[] = [
            {
                email: "petaxa_three@gmail.com",
                name: "petaxa",
                password: "$12365gjoiwe",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.deactived,
                verified: 1,
                id: 1,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
        ];
        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;
        await jestPrismaClient.user.createMany({
            data: mockUsers,
        });

        await expect(
            findActivedUser({ id: 9 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("ユーザーが見つかりません。")
        );
    });

    test("ユーザーが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        const jestPrismaClient = jestPrisma.client as typeof customizedPrisma;

        await expect(
            findActivedUser({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("ユーザーが見つかりません。")
        );
    });
});
