import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  tokenNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  BadRequestError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { basicHttpResponce } from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import {
  sendResponse,
  updatePassword,
  updatePasswordErrorHandle,
  validationErrorHandle,
} from "../execute";

jest.mock("@/utils/errorHandle/errorHandling", () => ({
  ...jest.requireActual("@/utils/errorHandle/errorHandling"),
  badRequestErrorHandle: jest.fn(),
  tokenNotFoundErrorHandle: jest.fn(),
  dbRecordNotFoundErrorHandle: jest.fn(),
}));

jest.mock("@/utils/prismaClients", () => ({
  customizedPrisma: {
    user: {
      findUniqueOrThrow: jest
        .fn()
        .mockImplementation((arg: Prisma.UserFindUniqueOrThrowArgs) => {
          if (arg.where.id === 1) {
            // 正常
            const user = {
              id: 1,
              email: "mock-email",
              name: "mock-name",
              password: "mock-password",
              verifyEmailHash: null,
              passResetHash: "mock-hash",
              verified: 1,
              loginStatus: 1,
              createdAt: new Date("2022-10-10 11:00"),
              updatedAt: new Date("2022-10-10 11:00"),
            };
            return user;
          } else if (arg.where.id === 90) {
            // passResetHashなし
            const user = {
              id: 90,
              email: "mock-email",
              name: "mock-name",
              password: "mock-password",
              verifyEmailHash: null,
              passResetHash: null,
              verified: 1,
              loginStatus: 1,
              createdAt: new Date("2022-10-10 11:00"),
              updatedAt: new Date("2022-10-10 11:00"),
            };
            return user;
          } else if (arg.where.id === 91) {
            // passResetHashが一致しない
            const user = {
              id: 91,
              email: "mock-email",
              name: "mock-name",
              password: "mock-password",
              verifyEmailHash: null,
              passResetHash: "discrepancy-hash",
              verified: 1,
              loginStatus: 1,
              createdAt: new Date("2022-10-10 11:00"),
              updatedAt: new Date("2022-10-10 11:00"),
            };
            return user;
          } else {
            // idに一致するレコードがない
            throw new PrismaClientKnownRequestError("message", {
              code: "mock-code",
              clientVersion: "mock-version",
              batchRequestIdx: 1,
            });
          }
        }),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/utils/utilResponse", () => ({
  ...jest.requireActual("@/utils/utilResponse"),
  basicHttpResponce: jest.fn(),
}));
jest.mock("@/utils/logger/utilLogger", () => ({
  ...jest.requireActual("@/utils/logger/utilLogger"),
  logResponse: jest.fn(),
}));

describe("validationErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("BadRequestErrorを受けたらbadRequestErrorHandleを実行", () => {
    try {
      throw new BadRequestError("message");
    } catch (e) {
      validationErrorHandle(e, mockReq as Request, mockRes as Response);
    }

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "executeResettingPassword"
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるかを確認するためにwrapする
    const test = () => {
      validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("updatePasswordのテスト", () => {
  test("正常に書き込みが行われる", async () => {
    // 正常なユーザーを返却するidで実行
    await updatePassword(1, "mock-hash", "mock-password");

    await expect(customizedPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
    await expect(customizedPrisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        passResetHash: "",
        password: "mock-password",
      },
    });
  });

  test("tokenが見つからず、TokenNotFoundErrorが投げられる", async () => {
    // passResetHashがnullのユーザーを返却するidで実行
    const test = async () => {
      await updatePassword(90, "mock-hash", "mock-password");
    };

    await expect(test).rejects.toThrow(
      new TokenNotFoundError("トークンが見つかりません。")
    );
    await expect(customizedPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: 90,
      },
    });
  });

  test("tokenが一致せず、TokenNotFoundErrorが投げられる", async () => {
    // passResetHashがdiscrepancy-hashのユーザーを返却するidで実行
    const test = async () => {
      await updatePassword(91, "mock-hash", "mock-password");
    };

    await expect(test).rejects.toThrow(
      new TokenNotFoundError("トークンが見つかりません。")
    );
    await expect(customizedPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: 91,
      },
    });
  });
});

describe("updatePasswordErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("TokenNotFoundErrorを受けたらtokenNotFoundErrorHandleを実行", () => {
    try {
      throw new TokenNotFoundError("message");
    } catch (e) {
      updatePasswordErrorHandle(e, mockReq as Request, mockRes as Response, 1);
    }

    expect(tokenNotFoundErrorHandle).toHaveBeenCalledWith(
      new TokenNotFoundError("message"),
      1,
      mockReq as Request,
      mockRes as Response,
      "executeResettingPassword"
    );
  });

  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleを実行", () => {
    const knownErrorParams = {
      code: "mock-code",
      clientVersion: "mock-version",
      batchRequestIdx: 1,
    };
    try {
      throw new PrismaClientKnownRequestError("message", knownErrorParams);
    } catch (e) {
      updatePasswordErrorHandle(e, mockReq as Request, mockRes as Response, 1);
    }

    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      new PrismaClientKnownRequestError("message", knownErrorParams),
      1,
      mockReq as Request,
      mockRes as Response,
      "executeResettingPassword"
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      updatePasswordErrorHandle(
        new Error(),
        mockReq as Request,
        mockRes as Response,
        1
      );
    };

    expect(test).toThrow(new Error());
  });
});

describe("sendResponseのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("正常に動作", () => {
    sendResponse(mockReq as Request, mockRes as Response);

    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "パスワードのリセットが完了しました。"
    );
    expect(logResponse).toHaveBeenCalledWith(
      "unspecified",
      mockReq,
      200,
      "パスワードのリセットが完了しました。",
      "executeResettingPassword"
    );
  });
});
