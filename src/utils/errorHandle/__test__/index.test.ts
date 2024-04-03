import type { Request, Response } from "express";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { errorResponseHandler } from "@/utils/errorHandle/index";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  internalServerErrorHandle,
  multipleActiveUsersErrorHandle,
  tokenNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

jest.mock("@/utils/errorHandle/errorHandling", () => ({
  ...jest.requireActual("@/utils/errorHandle/errorHandling"),
  dbRecordNotFoundErrorHandle: jest.fn(),
  multipleActiveUsersErrorHandle: jest.fn(),
  tokenNotFoundErrorHandle: jest.fn(),
  badRequestErrorHandle: jest.fn(),
  internalServerErrorHandle: jest.fn(),
}));

describe("errorResponseHandlerのテスト", () => {
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

  test("DbRecordNotFoundErrorインスタンスの処理", () => {
    const error = new DbRecordNotFoundError();
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });

  test("PrismaClientKnownRequestErrorインスタンスの処理", () => {
    const error = new PrismaClientKnownRequestError("msg", {
      code: "",
      clientVersion: "",
    });
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });

  test("MultipleActiveUserErrorインスタンスの処理", () => {
    const error = new MultipleActiveUserError();
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(multipleActiveUsersErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });
  test("TokenNotFoundErrorインスタンスの処理", () => {
    const error = new TokenNotFoundError();
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(tokenNotFoundErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });
  test("BadRequestErrorインスタンスの処理", () => {
    const error = new BadRequestError();
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });
  test("その他のインスタンスの処理", () => {
    const error = new Error();
    const userId = 10;
    const funcName = "errorResponseHandlerのテスト";
    errorResponseHandler(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );

    expect(internalServerErrorHandle).toHaveBeenCalledWith(
      error,
      userId,
      mockReq as Request,
      mockRes as Response,
      funcName
    );
  });
});
