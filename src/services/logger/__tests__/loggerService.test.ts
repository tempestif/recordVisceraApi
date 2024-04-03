import {
  logError,
  logResponse,
  maskConfInfoInReqBody,
} from "@/services/logger/loggerService";
import { Request } from "express";
import { CustomLogger } from "@/services/logger/loggerClass";

jest.mock("@/services/logger/loggerClass");

describe("maskConfInfoInReqBodyのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    const mockRequest: Partial<Request> = {
      body: {
        userId: "123",
        email: "Anonymised, right?",
        password: "Anonymised, right?",
      },
    };
    const result = maskConfInfoInReqBody(mockRequest as Request);

    expect(result).toEqual({
      body: {
        userId: "123",
        email: "****",
        password: "****",
      },
    });
  });

  test("ネストしている", () => {
    const mockRequest: Partial<Request> = {
      body: {
        userId: "123",
        email: "Anonymised, right?",
        password: "Anonymised, right?",
        obj: {
          password: "Anonymised, right?",
          user: {
            email: "Anonymised, right?",
          },
        },
      },
    };
    const result = maskConfInfoInReqBody(mockRequest as Request);

    expect(result).toEqual({
      body: {
        userId: "123",
        email: "****",
        password: "****",
        obj: {
          password: "****",
          user: {
            email: "****",
          },
        },
      },
    });
  });
});

describe("logErrorのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("正常", () => {
    // テスト対象実行
    const responseMsg = "message-logError";
    const userId = 1;
    const req: Partial<Request> = {
      body: {
        ip: "ip-logError",
        method: "ip-method",
        path: "ip-originalUrl",
        body: "ip-body",
      },
    };
    const HttpStatus = 100;
    const funcName = "funcName-logError";
    logError(userId, req as Request, HttpStatus, responseMsg, funcName);

    const expectMessage = `${funcName} failure`;
    const expectLogBody = {
      userId,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      status: String(HttpStatus),
      responseMsg,
    };

    const loggerInstance = (CustomLogger as jest.Mock).mock.instances[0];
    expect(loggerInstance.error.mock.calls[0]).toEqual([
      expectMessage,
      expectLogBody,
    ]);
  });
});

describe("logResponseのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("正常", () => {
    // テスト対象実行
    const responseMsg = "message-logResponse";
    const userId = 1;
    const req: Partial<Request> = {
      body: {
        ip: "ip-logResponse",
        method: "ip-method",
        path: "ip-originalUrl",
        body: {
          test: "test",
          password: "hoge",
          email: "hogehoge@mail",
        },
      },
    };
    const HttpStatus = 100;
    const funcName = "funcName-logResponse";
    logResponse(userId, req as Request, HttpStatus, responseMsg, funcName);

    const expectMessage = `${funcName} success`;
    const expectLogBody = {
      userId,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: {
        ip: "ip-logResponse",
        method: "ip-method",
        path: "ip-originalUrl",
        body: {
          test: "test",
          password: "****",
          email: "****",
        },
      },
      status: String(HttpStatus),
      responseMsg,
    };

    const loggerInstance = (CustomLogger as jest.Mock).mock.instances[0];
    expect(loggerInstance.log.mock.calls[0]).toEqual([
      expectMessage,
      expectLogBody,
    ]);
  });
});
