import {
  describe,
  expect,
  jest,
  test,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { User } from "@prisma/client";
import * as bcryptService from "@/utils/bcrypt";

// テスト用PrismaClient作成
const jestPrismaClient = jestPrisma.client;

describe("customizedPrismaのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("user.create", async () => {
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
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");

    // テストデータをDBに格納
    await jestPrismaClient.user.create({
      data: mockUser,
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
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

    expect(result).toEqual(expectUser);
  });

  test("user.createMany", async () => {
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
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");

    // テストデータをDBに格納
    await jestPrismaClient.user.createMany({
      data: [mockUser],
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
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

    expect(result).toEqual(expectUser);
  });

  test("user.update", async () => {
    // テストデータ
    const mockUser: User = {
      email: "hoge@gmail.com",
      name: "hoge",
      password: "$12365gjoiwe",
      verifyEmailHash: "hash",
      passResetHash: "hash",
      loginStatus: 0,
      verified: 0,
      id: 1,
      createdAt: new Date("2023-09-01T02:00:00Z"),
      updatedAt: new Date("2023-09-01T04:00:00Z"),
    };
    const updatedMockUser: User = {
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

    // テストデータをDBに格納
    await jestPrismaClient.user.create({
      data: mockUser,
    });

    // ハッシュ関数をモック化
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");
    // テストデータでDBを更新
    await jestPrismaClient.user.update({
      where: { id: 1 },
      data: updatedMockUser,
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
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

    expect(result).toEqual(expectUser);
  });

  test("user.updateMany", async () => {
    // テストデータ
    const mockUser: User = {
      email: "hoge@gmail.com",
      name: "hoge",
      password: "$12365gjoiwe",
      verifyEmailHash: "hash",
      passResetHash: "hash",
      loginStatus: 0,
      verified: 0,
      id: 1,
      createdAt: new Date("2023-09-01T02:00:00Z"),
      updatedAt: new Date("2023-09-01T04:00:00Z"),
    };
    const updatedMockUser: User = {
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

    // テストデータをDBに格納
    await jestPrismaClient.user.create({
      data: mockUser,
    });

    // ハッシュ関数をモック化
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");
    // テストデータでDBを更新
    await jestPrismaClient.user.updateMany({
      where: { id: 1 },
      data: updatedMockUser,
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
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

    expect(result).toEqual(expectUser);
  });

  test("user.upsert -create", async () => {
    // テストデータ
    const mockUser: User = {
      email: "hoge@gmail.com",
      name: "hoge",
      password: "$12365gjoiwe",
      verifyEmailHash: "hash",
      passResetHash: "hash",
      loginStatus: 0,
      verified: 0,
      id: 1,
      createdAt: new Date("2023-09-01T02:00:00Z"),
      updatedAt: new Date("2023-09-01T04:00:00Z"),
    };
    const updatedMockUser: User = {
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
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");

    // テストデータをDBに格納
    await jestPrismaClient.user.upsert({
      where: { id: 1 },
      create: mockUser,
      update: updatedMockUser,
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
    const expectUser: User = {
      email: "hoge@gmail.com",
      name: "hoge",
      password: "[hashed_value -createHashedPass]",
      verifyEmailHash: "hash",
      passResetHash: "hash",
      loginStatus: 0,
      verified: 0,
      id: 1,
      createdAt: new Date("2023-09-01T02:00:00Z"),
      updatedAt: new Date("2023-09-01T04:00:00Z"),
    };

    expect(result).toEqual(expectUser);
  });

  test("user.upsert -update", async () => {
    // テストデータ
    const mockUser: User = {
      email: "hoge@gmail.com",
      name: "hoge",
      password: "$12365gjoiwe",
      verifyEmailHash: "hash",
      passResetHash: "hash",
      loginStatus: 0,
      verified: 0,
      id: 1,
      createdAt: new Date("2023-09-01T02:00:00Z"),
      updatedAt: new Date("2023-09-01T04:00:00Z"),
    };
    const updatedMockUser: User = {
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
    await jestPrismaClient.user.create({
      data: mockUser,
    });

    // ハッシュ関数をモック化
    jest
      .spyOn(bcryptService, "createHashedPass")
      .mockImplementation(() => "[hashed_value -createHashedPass]");

    // テストデータをDBに格納
    await jestPrismaClient.user.upsert({
      where: { id: 1 },
      create: mockUser,
      update: updatedMockUser,
    });

    // TODO: FIXME: 本当は生のprismaClientで取得したい！！！！！
    // const rowPrismaClient = new RowPrisma(jestPrismaClient);
    // const result = await rowPrismaClient.find("User", { id: 1 });

    const result = await jestPrismaClient.user.findUnique({
      where: { id: 1 },
    });

    // 想定データ
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

    expect(result).toEqual(expectUser);
  });
});
