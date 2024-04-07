import {
  executeResettingPassword,
  prepareResettingPassword,
} from "@/controllers/resetPasswords/resetPasswords";
import * as executeService from "@/services/resetPasswords/endpoints/execute";
import * as prepareService from "@/services/resetPasswords/endpoints/prepare";
import {
  DbRecordNotFoundError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { throwValidationError } from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { validationResult } from "express-validator";

jest.mock("express-validator", () => ({
  ...jest.requireActual("express-validator"),
  validationResult: jest.fn().mockReturnValue("mock-validationResult"),
}));
jest.mock("@/utils/errorHandle/validate", () => ({
  ...jest.requireActual("@/utils/errorHandle/validate"),
  throwValidationError: jest.fn(),
}));
jest.mock("@/services/resetPasswords/endpoints/prepare", () => ({
  ...jest.requireActual("@/services/resetPasswords/endpoints/prepare"),
  createPassResetHash: jest.fn().mockImplementation(() => "mock-hash"),
  setPassResetHash: jest.fn().mockImplementation(() => ({
    email: "mock-email",
    name: "mock-name",
    password: "mock-password",
    verifyEmailHash: null,
    passResetHash: "mock-hash",
    verified: 1,
    loginStatus: 1,
    id: 1,
    createdAt: new Date("2022-10-11 11:00"),
    updatedAt: new Date("2022-10-11 11:00"),
  })),
  sendVerifyMail: jest.fn(),
  sendResponse: jest.fn(),
  validationErrorHandle: jest.fn(),
  setPassResetHashErrorHandle: jest.fn(),
  sendVerifyMailErrorHandle: jest.fn(),
}));

jest.mock("@/services/resetPasswords/endpoints/execute", () => ({
  ...jest.requireActual("@/services/resetPasswords/endpoints/execute"),
  updatePassword: jest.fn(),
  sendResponse: jest.fn(),
  validationErrorHandle: jest.fn(),
  updatePasswordErrorHandle: jest.fn(),
}));

describe("requestResettingPasswordのテスト", () => {
  const mockReq: Partial<Request> = {
    ip: "mock-ip",
    method: "mock-method",
    path: "mock-path",
    body: {
      userId: 1,
    },
  };
  const mockRes: Partial<Response> = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常に動作", async () => {
    // テスト対象実行
    await prepareResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(prepareService.createPassResetHash).toHaveBeenCalled();
    await expect(prepareService.setPassResetHash).toHaveBeenCalledWith(
      1,
      "mock-hash"
    );
    await expect(prepareService.sendVerifyMail).toHaveBeenCalledWith({
      email: "mock-email",
      name: "mock-name",
      password: "mock-password",
      verifyEmailHash: null,
      passResetHash: "mock-hash",
      verified: 1,
      loginStatus: 1,
      id: 1,
      createdAt: new Date("2022-10-11 11:00"),
      updatedAt: new Date("2022-10-11 11:00"),
    });
    expect(prepareService.sendResponse).toHaveBeenCalledWith(mockReq, mockRes);
  });

  test("バリデーションエラーがあるとき、validationErrorHandleを実行", async () => {
    (throwValidationError as jest.Mock).mockImplementationOnce(() => {
      throw new DbRecordNotFoundError("message");
    });

    // テスト対象実行
    await prepareResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(prepareService.validationErrorHandle).toHaveBeenCalledWith(
      new DbRecordNotFoundError("message"),
      mockReq,
      mockRes
    );
  });

  test("setPassResetHashがエラーだったらsetPassResetHashErrorHandleを実行", async () => {
    const knownErrorParams = {
      code: "mock-code",
      clientVersion: "mock-version",
      batchRequestIdx: 1,
    };
    (prepareService.setPassResetHash as jest.Mock).mockImplementationOnce(
      () => {
        throw new Prisma.PrismaClientKnownRequestError(
          "message",
          knownErrorParams
        );
      }
    );

    // テスト対象実行
    await prepareResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(prepareService.createPassResetHash).toHaveBeenCalled();
    await expect(prepareService.setPassResetHash).toHaveBeenCalledWith(
      1,
      "mock-hash"
    );
    expect(prepareService.setPassResetHashErrorHandle).toHaveBeenCalledWith(
      new Prisma.PrismaClientKnownRequestError("message", knownErrorParams),
      mockReq,
      mockRes,
      1
    );
  });

  test("sendVerifyMailがエラーだったらsendVerifyMailErrorHandleを実行", async () => {
    (prepareService.sendVerifyMail as jest.Mock).mockImplementationOnce(() => {
      throw new Error("message");
    });

    // テスト対象実行
    await prepareResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(prepareService.createPassResetHash).toHaveBeenCalled();
    await expect(prepareService.setPassResetHash).toHaveBeenCalledWith(
      1,
      "mock-hash"
    );
    await expect(prepareService.sendVerifyMail).toHaveBeenCalledWith({
      email: "mock-email",
      name: "mock-name",
      password: "mock-password",
      verifyEmailHash: null,
      passResetHash: "mock-hash",
      verified: 1,
      loginStatus: 1,
      id: 1,
      createdAt: new Date("2022-10-11 11:00"),
      updatedAt: new Date("2022-10-11 11:00"),
    });
    expect(prepareService.sendVerifyMailErrorHandle).toHaveBeenCalledWith(
      new Error("message"),
      mockReq,
      mockRes,
      1
    );
  });
});

describe("executeResettingPasswordのテスト", () => {
  const mockReq: Partial<Request> = {
    ip: "mock-ip",
    method: "mock-method",
    path: "mock-path",
    body: {
      id: 1,
      token: "mock-token",
      newPassword: "mock-password",
    },
  };
  const mockRes: Partial<Response> = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常に動作", async () => {
    // テスト対象実行
    await executeResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(executeService.updatePassword).toHaveBeenCalledWith(
      1,
      "mock-token",
      "mock-password"
    );
    expect(executeService.sendResponse).toHaveBeenCalledWith(mockReq, mockRes);
  });

  test("バリデーションエラーがあるとき、validationErrorHandleを実行", async () => {
    (throwValidationError as jest.Mock).mockImplementationOnce(() => {
      throw new DbRecordNotFoundError("message");
    });

    // テスト対象実行
    await executeResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(executeService.validationErrorHandle).toHaveBeenCalledWith(
      new DbRecordNotFoundError("message"),
      mockReq,
      mockRes
    );
  });

  test("updatePasswordがエラーだったらupdatePasswordErrorHandleを実行", async () => {
    (executeService.updatePassword as jest.Mock).mockImplementationOnce(() => {
      throw new TokenNotFoundError("message");
    });

    // テスト対象実行
    await executeResettingPassword(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(throwValidationError).toHaveBeenCalledWith("mock-validationResult");
    expect(executeService.updatePassword).toHaveBeenCalledWith(
      1,
      "mock-token",
      "mock-password"
    );
    expect(executeService.updatePasswordErrorHandle).toHaveBeenCalledWith(
      new TokenNotFoundError("message"),
      mockReq,
      mockRes,
      1
    );
  });
});
