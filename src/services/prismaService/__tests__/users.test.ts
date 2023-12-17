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
import * as bcryptService from "@/services/bcryptService";

// テスト用PrismaClient作成
const jestPrismaClient = jestPrisma.client;

describe("findUniqueUserAbsoluteExistの単体テスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("ユーザーが存在する場合、データを返す", async () => {
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

        // ハッシュ関数をモック化
        jest.spyOn(bcryptService, "createHashedPass").mockImplementation(
            async () => "[hashed_value -createHashedPass]"
        );

        // テストデータをDBに格納
        await jestPrismaClient.user.create({
            data: mockUser,
        });

        // 想定されるデータ
        const expectUser: User = {
            email: "petaxa@gmail.com",
            name: "petaxa",
            password: "[hashed_value -createHashedPass]",
            verifyEmailHash: null,
            passResetHash: null,
            loginStatus: 1,
            verified: 1,
            id: 1,
            createdAt: new Date("2023-09-05T10:00:00Z"),
            updatedAt: new Date("2023-09-05T11:00:00Z"),
        };

        // テスト実行
        const result = await findUniqueUserAbsoluteExist(
            { id: 1 },
            jestPrismaClient
        );
        expect(result).toEqual(expectUser);
    });

    test("ユーザーが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        // テスト実行
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
        // テストデータ
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

        // ハッシュ関数をモック化
        jest.spyOn(bcryptService, "createHashedPass").mockImplementation(
            async () => "[hashed_value -createHashedPass]"
        );

        // テストデータをDBに格納
        await jestPrismaClient.user.createMany({
            data: mockUsers,
        });

        // 想定されるデータ
        const expectUsers: User[] = [
            {
                email: "petaxa_one@gmail.com",
                name: "petaxa",
                password: "[hashed_value -createHashedPass]",
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
                password: "[hashed_value -createHashedPass]",
                verifyEmailHash: null,
                passResetHash: null,
                loginStatus: USER_LOGIN_STATUS.logout,
                verified: 1,
                id: 2,
                createdAt: new Date("2023-09-05T10:00:00Z"),
                updatedAt: new Date("2023-09-05T11:00:00Z"),
            },
        ];

        // テスト実行
        const result = await findActivedUser({}, jestPrismaClient);
        expect(result).toEqual(expectUsers);
    });

    test("退会済みユーザーのみの場合、DbRecordNotFoundErrorを投げる", async () => {
        // テストデータ
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

        // テストデータをDBに格納
        await jestPrismaClient.user.createMany({
            data: mockUsers,
        });

        // テスト実行
        await expect(
            findActivedUser({ id: 9 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("ユーザーが見つかりません。")
        );
    });

    test("ユーザーが存在しない場合、DbRecordNotFoundErrorを投げる", async () => {
        // テスト実行
        await expect(
            findActivedUser({ id: 1 }, jestPrismaClient)
        ).rejects.toThrow(
            new DbRecordNotFoundError("ユーザーが見つかりません。")
        );
    });
});
