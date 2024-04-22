import { registUser } from "@/controllers/account";
import { sendMailForEmailVerify } from "@/services/accountService";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { basicHttpResponce } from "@/utils/utilResponse";
import { randomBytes } from "crypto";
import type { Request, Response } from "express";

jest.mock("@/utils/utilResponse", () => ({
  ...jest.requireActual("@/utils/utilResponse"),
  basicHttpResponce: jest.fn(),
}));
jest.mock("@/utils/logger/utilLogger", () => ({
  ...jest.requireActual("@/utils/logger/utilLogger"),
  logResponse: jest.fn(),
}));
jest.mock("@/utils/prismaClients", () => ({
  customizedPrisma: {
    user: {
      findMany: jest.fn().mockImplementation(() => []),
      create: jest.fn().mockImplementation(() => ({
        id: 10,
        email: "testmail@test",
        password: "password",
        name: "hoge",
        verifyEmailHash: "mock-hash",
        passResetHash: null,
        verified: 1,
        loginStatus: 1,
        createdAt: new Date("2023-11-01T07:01:13.000Z"),
        updatedAt: new Date("2023-11-11T07:01:13.000Z"),
      })),
    },
    profile: {
      create: jest.fn(),
    },
  },
}));
jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockImplementation(() => "mock-hash"),
  })),
}));
jest.mock("@/services/accountService", () => ({
  sendMailForEmailVerify: jest.fn(),
}));

describe("registUserのテスト", () => {
  let mockReq: Partial<Request>;
  const mockRes: Partial<Response> = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: {},
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", async () => {
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: {
        userId: "10",
        date: "2023-10-13T17:40:33.000Z",
        email: "testmail@test",
        password: "password",
        name: "hoge",
      },
    };

    // テスト対象実行
    await registUser(mockReq as Request, mockRes as Response, next);

    // 確認
    const randomBytesInstance = (randomBytes as jest.Mock).mock.results[0]
      .value;
    expect(randomBytesInstance.toString).toHaveBeenCalledWith("hex");

    const customizedPrismaUserCreateInstance = customizedPrisma.user
      .create as jest.Mock;
    expect(customizedPrismaUserCreateInstance).toHaveBeenCalledWith({
      data: {
        email: "testmail@test",
        password: "password",
        name: "hoge",
        verifyEmailHash: "mock-hash",
      },
    });

    const customizedPrismaProfileCreateInstance = customizedPrisma.profile
      .create as jest.Mock;
    expect(customizedPrismaProfileCreateInstance).toHaveBeenCalledWith({
      data: {
        userId: 10,
      },
    });

    expect(sendMailForEmailVerify).toHaveBeenCalledWith(
      "testmail@test",
      `${process.env.BASE_URL}/users/10/verify/mock-hash`,
    );

    const httpStatus = 201;
    const responseStatus = true;
    const responseMsg = "ユーザー認証のためのメールが送信されました。";
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      httpStatus,
      responseStatus,
      responseMsg,
    );

    expect(logResponse).toHaveBeenCalledWith(
      "unspecified",
      mockReq,
      httpStatus,
      responseMsg,
      "registUser",
    );
  });
});
