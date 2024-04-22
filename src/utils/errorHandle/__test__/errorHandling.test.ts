import { UNEXPECTED_ERROR } from "@/consts/logMessages";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  internalServerErrorHandle,
  multipleActiveUsersErrorHandle,
  tokenNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { logError } from "@/utils/logger/utilLogger";
import { basicHttpResponce } from "@/utils/utilResponse";
import type { Request, Response } from "express";

jest.mock("@/utils/utilResponse", () => ({
  ...jest.requireActual("@/utils/utilResponse"),
  basicHttpResponce: jest.fn(),
}));
jest.mock("@/utils/logger/utilLogger", () => ({
  ...jest.requireActual("@/utils/logger/utilLogger"),
  logError: jest.fn(),
}));

describe("internalServerErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {
    ip: "mock-ip",
    method: "mock-method",
    path: "mock-path",
    body: "mock-body",
  };
  const mockRes: Partial<Response> = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Errorインスタンスの処理", () => {
    // mockの用意
    const error = new Error("Error instance");
    const mockUserId = 10;
    const funcName = "internalServerErrorHandleのテスト";

    // テスト対象実行
    internalServerErrorHandle(
      error,
      mockUserId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    const httpStatus = 500;
    expect(logError).toHaveBeenCalledWith(
      mockUserId,
      mockReq,
      httpStatus,
      funcName,
      "Error instance",
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes as Response,
      httpStatus,
      false,
      "Error instance",
    );
  });

  test("Errorインスタンス以外のエラー", () => {
    // mockの用意
    const error = "Error instance";
    const mockUserId = 10;
    const funcName = "internalServerErrorHandleのテスト";

    // テスト対象実行
    internalServerErrorHandle(
      error,
      mockUserId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    const httpStatus = 500;
    expect(logError).toHaveBeenCalledWith(
      mockUserId,
      mockReq,
      httpStatus,
      funcName,
      UNEXPECTED_ERROR.message,
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes as Response,
      httpStatus,
      false,
      "unexpected error",
    );
  });
});

describe("dbRecordNotFoundErrorHandleのテスト", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: "mock-body",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    // テストデータ
    const userId = 10;
    const HttpStatus = 401;
    const responseStatus = false;
    const errorMassage = "DbRecordNotFoundError instance";
    const error = new DbRecordNotFoundError(errorMassage);
    const funcName = "internalServerErrorHandleのテスト";

    // テスト対象実行
    dbRecordNotFoundErrorHandle(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    expect(logError).toHaveBeenCalledWith(
      userId,
      mockReq,
      HttpStatus,
      funcName,
      errorMassage,
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      HttpStatus,
      responseStatus,
      errorMassage,
    );
  });
});

describe("multipleActiveUsersErrorHandleのテスト", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: "mock-body",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    // テストデータ
    const userId = 10;
    const HttpStatus = 500;
    const responseStatus = false;
    const errorMassage = "multipleActiveUsersErrorHandle instance";
    const error = new MultipleActiveUserError(errorMassage);
    const funcName = "multipleActiveUsersErrorHandleのテスト";

    // テスト対象実行
    multipleActiveUsersErrorHandle(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    expect(logError).toHaveBeenCalledWith(
      userId,
      mockReq,
      HttpStatus,
      funcName,
      errorMassage,
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      HttpStatus,
      responseStatus,
      errorMassage,
    );
  });
});

describe("tokenNotFoundErrorHandleのテスト", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: "mock-body",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    // テストデータ
    const userId = 10;
    const HttpStatus = 400;
    const responseStatus = false;
    const errorMassage = "tokenNotFoundErrorHandle instance";
    const error = new TokenNotFoundError(errorMassage);
    const funcName = "tokenNotFoundErrorHandleのテスト";

    // テスト対象実行
    tokenNotFoundErrorHandle(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    expect(logError).toHaveBeenCalledWith(
      userId,
      mockReq,
      HttpStatus,
      funcName,
      errorMassage,
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      HttpStatus,
      responseStatus,
      errorMassage,
    );
  });
});

describe("badRequestErrorHandleのテスト", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: "mock-body",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    // テストデータ
    const userId = 10;
    const errorMassage = "badRequestErrorHandle instance";
    const error = new BadRequestError(errorMassage);
    const funcName = "badRequestErrorHandleのテスト";

    // テスト対象実行
    badRequestErrorHandle(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName,
    );

    const HttpStatus = 400;
    const responseStatus = false;

    expect(logError).toHaveBeenCalledWith(
      userId,
      mockReq,
      HttpStatus,
      funcName,
      errorMassage,
    );
    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      HttpStatus,
      responseStatus,
      errorMassage,
    );
  });
});
