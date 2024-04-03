import type { Request, Response, NextFunction } from "express";
import { auth } from "@/services/authService";
import { verify } from "jsonwebtoken";
import { findUniqueUserAbsoluteExist } from "@/services/prismaService";
import { USER_LOGIN_STATUS } from "@/consts/db";
import { basicHttpResponce } from "@/services/utilResponseService";

// auth内で使う関数, 変数をモック化
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(),
}));
jest.mock("@/services/prismaService", () => ({
  ...jest.requireActual("@/services/prismaService"),
  findUniqueUserAbsoluteExist: jest.fn(),
}));
jest.mock("@/services/utilResponseService", () => ({
  ...jest.requireActual("@/services/utilResponseService"),
  basicHttpResponce: jest.fn(),
}));

// 有効なトークンとユーザーの設定
const VALID_TOKEN = "VALID_TOKEN";
const DECODED_TOKEN = { id: 1 };
const ACTIVE_USER = {
  email: "petaxa@gmail.com",
  name: "petaxa",
  password: "$12365gjoiwe",
  verifyEmailHash: null,
  passResetHash: null,
  loginStatus: USER_LOGIN_STATUS.login,
  verified: 1,
  id: 1,
  createdAt: new Date("2023-09-05T10:00:00Z"),
  updatedAt: new Date("2023-09-05T11:00:00Z"),
};

describe("authの単体テスト", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    // request, response, nextをモック化
    mockRequest = {
      header: jest.fn(),
      body: {
        userId: "",
      },
    };
    nextFunction = jest.fn();

    // auth内の関数をモック化
    // トークン取得
    mockRequest.header = jest.fn().mockReturnValue(VALID_TOKEN);
    // トークンのデコード
    (verify as jest.Mock).mockResolvedValue(DECODED_TOKEN);
    // user取得
    (findUniqueUserAbsoluteExist as jest.Mock).mockResolvedValue(ACTIVE_USER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", async () => {
    // テスト対象実行
    await auth(mockRequest as Request, mockResponse as Response, nextFunction);

    // verifyが実行されたことを確認
    expect(verify).toHaveBeenCalledWith(VALID_TOKEN, expect.anything());
    // findUniqueUserAbsoluteExistが実行されたことを確認
    expect(findUniqueUserAbsoluteExist).toHaveBeenCalledWith(
      { id: DECODED_TOKEN.id },
      expect.anything(),
    );
    // userIdが正しくセットされていることを確認
    expect(mockRequest.body.userId).toBe(DECODED_TOKEN.id);
    // next()が呼ばれたことを確認
    expect(nextFunction).toHaveBeenCalled();
  });

  test("tokenがない", async () => {
    // auth内の関数をモック化
    // トークン取得(取得できない)
    mockRequest.header = jest.fn().mockReturnValueOnce(null);
    // レスポンス作成
    (basicHttpResponce as jest.Mock).mockResolvedValueOnce("400Error");

    // テスト対象実行
    await auth(mockRequest as Request, mockResponse as Response, nextFunction);

    // 正しい引数でbasicHttpResponceが呼ばれたことを確認
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockResponse,
      400,
      false,
      "トークンが見つかりません。",
    );
  });

  test("PrivateKeyがない", async () => {
    // JWTPRIVATEKEYをmock化
    const originalEnvVar = process.env.JWTPRIVATEKEY;
    process.env.JWTPRIVATEKEY = "";

    try {
      // テスト実行
      await expect(
        auth(mockRequest as Request, mockResponse as Response, nextFunction),
      ).rejects.toThrow("auth: 環境変数が足りません");
    } finally {
      // 環境変数を元に戻す
      process.env.JWTPRIVATEKEY = originalEnvVar;
    }
  });

  test("userがlogoutしている", async () => {
    const logoutUser = {
      email: "petaxa@gmail.com",
      name: "petaxa",
      password: "$12365gjoiwe",
      verifyEmailHash: null,
      passResetHash: null,
      loginStatus: USER_LOGIN_STATUS.logout,
      verified: 1,
      id: 1,
      createdAt: new Date("2023-09-05T10:00:00Z"),
      updatedAt: new Date("2023-09-05T11:00:00Z"),
    };

    // user取得をmock化
    (findUniqueUserAbsoluteExist as jest.Mock).mockResolvedValueOnce(
      logoutUser,
    );

    // テスト対象実行
    await auth(mockRequest as Request, mockResponse as Response, nextFunction);

    // 正しい引数でbasicHttpResponceが呼ばれたことを確認
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockResponse,
      400,
      false,
      "トークンが一致しません。",
    );
  });

  test("userが退会している", async () => {
    const deactivedUser = {
      email: "petaxa@gmail.com",
      name: "petaxa",
      password: "$12365gjoiwe",
      verifyEmailHash: null,
      passResetHash: null,
      loginStatus: USER_LOGIN_STATUS.deactived,
      verified: 1,
      id: 1,
      createdAt: new Date("2023-09-05T10:00:00Z"),
      updatedAt: new Date("2023-09-05T11:00:00Z"),
    };

    // user取得をmock化
    (findUniqueUserAbsoluteExist as jest.Mock).mockResolvedValueOnce(
      deactivedUser,
    );

    // テスト対象実行
    await auth(mockRequest as Request, mockResponse as Response, nextFunction);

    // 正しい引数でbasicHttpResponceが呼ばれたことを確認
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockResponse,
      400,
      false,
      "トークンが一致しません。",
    );
  });
});
