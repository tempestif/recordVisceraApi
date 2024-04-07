import {
  createPassResetHash,
  sendResponse,
  sendVerifyMail,
  sendVerifyMailErrorHandle,
  setPassResetHash,
  setPassResetHashErrorHandle,
  validationErrorHandle,
} from "@/services/resetPasswords/endpoints/prepare";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  internalServerErrorHandle,
  multipleActiveUsersErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
} from "@/utils/errorHandle/errors";
import { createHash } from "@/utils/hash";
import { logResponse } from "@/utils/logger/utilLogger";
import { sendMail } from "@/utils/nodemailer";
import { customizedPrisma } from "@/utils/prismaClients";
import { basicHttpResponce } from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

jest.mock("@/utils/errorHandle/errorHandling", () => ({
  ...jest.requireActual("@/utils/errorHandle/errorHandling"),
  badRequestErrorHandle: jest.fn(),
  multipleActiveUsersErrorHandle: jest.fn(),
  dbRecordNotFoundErrorHandle: jest.fn(),
  internalServerErrorHandle: jest.fn(),
}));

jest.mock("@/utils/hash", () => ({
  ...jest.requireActual("@/utils/hash"),
  createHash: jest.fn().mockImplementation(() => "mock-hash"),
}));

jest.mock("@/utils/prismaClients", () => ({
  customizedPrisma: {
    user: {
      update: jest.fn().mockImplementation((arg: Prisma.UserUpdateArgs) => {
        if (arg.where.id === 1) {
          const user = {
            name: "mock-name",
            email: "mock@email",
            password: "mock-password",
            verifyEmailHash: null,
            passResetHash: "mock-hash",
            verified: 1,
            loginStatus: 1,
            id: 1,
            createdAt: new Date("2022-10-20 11:10"),
            updatedAt: new Date("2022-10-20 11:10"),
          };
          return user;
        } else {
          throw new PrismaClientKnownRequestError("message", {
            code: "mock-code",
            clientVersion: "mock-version",
            batchRequestIdx: 1,
          });
        }
      }),
    },
  },
}));

jest.mock("@/utils/nodemailer", () => ({
  ...jest.requireActual("@/utils/nodemailer"),
  sendMail: jest.fn(),
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
  test("BadRequestErrorを受けたらbadRequestErrorHandleが実行される", () => {
    // エラーをcatchさせてテスト対象実行
    try {
      throw new BadRequestError("message");
    } catch (e) {
      validationErrorHandle(e, mockReq as Request, mockRes as Response);
    }

    // 確認
    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "prepareResettingPassword"
    );
  });

  test("MultipleActiveUserErrorを受けたらmultipleActiveUserErrorHandleが実行される", () => {
    // エラーをcatchさせてテスト対象実行
    try {
      throw new MultipleActiveUserError("message");
    } catch (e) {
      validationErrorHandle(e, mockReq as Request, mockRes as Response);
    }

    // 確認
    expect(multipleActiveUsersErrorHandle).toHaveBeenCalledWith(
      new MultipleActiveUserError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "prepareResettingPassword"
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      try {
        throw new DbRecordNotFoundError("message");
      } catch (e) {
        validationErrorHandle(e, mockReq as Request, mockRes as Response);
      }
    };

    // 確認
    expect(test).toThrow(new DbRecordNotFoundError("message"));
  });
});

describe("createPassResetHashのテスト", () => {
  test("createHashが実行されている", () => {
    // テスト対象実行
    const result = createPassResetHash();

    // 確認
    expect(createHash).toHaveBeenCalled();
    expect(result).toBe("mock-hash");
  });
});

describe("setPassResetHashのテスト", () => {
  test("updateが実行される", async () => {
    const result = await setPassResetHash(1, "mock-hash");

    // 正しい引数で実行されているか
    expect(customizedPrisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        passResetHash: "mock-hash",
      },
    });
    // updateの返り値が返却されているか
    expect(result).toEqual({
      name: "mock-name",
      email: "mock@email",
      password: "mock-password",
      verifyEmailHash: null,
      passResetHash: "mock-hash",
      verified: 1,
      loginStatus: 1,
      id: 1,
      createdAt: new Date("2022-10-20 11:10"),
      updatedAt: new Date("2022-10-20 11:10"),
    });
  });

  test("updateがエラーを投げたエラーがthrowされる", async () => {
    // throwされかを確認したいのでwrapする
    const test = async () => {
      await setPassResetHash(5, "mock-hash");
    };

    await expect(test).rejects.toThrow(
      new PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      })
    );
  });
});

describe("setPassResetHashErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    const knownErrorParams = {
      code: "mock-code",
      clientVersion: "mock-version",
      batchRequestIdx: 1,
    };
    // エラーをcatchさせてテスト対象実行
    try {
      throw new PrismaClientKnownRequestError("message", knownErrorParams);
    } catch (e) {
      setPassResetHashErrorHandle(
        e,
        mockReq as Request,
        mockRes as Response,
        1
      );
    }

    // 確認
    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      new PrismaClientKnownRequestError("message", knownErrorParams),
      1,
      mockReq,
      mockRes,
      "prepareResettingPassword"
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      try {
        throw new DbRecordNotFoundError("message");
      } catch (e) {
        setPassResetHashErrorHandle(
          e,
          mockReq as Request,
          mockRes as Response,
          1
        );
      }
    };

    // 確認
    expect(test).toThrow(new DbRecordNotFoundError("message"));
  });
});

describe("sendVerifyMailのテスト", () => {
  test("sendMailが実行される", async () => {
    const mockUser: Prisma.$UserPayload["scalars"] = {
      email: "mock-email",
      name: "mock-name",
      password: "mock-password",
      verifyEmailHash: "mock-hash",
      passResetHash: null,
      verified: 0,
      loginStatus: 1,
      id: 1,
      createdAt: new Date("2022-10-20 11:10"),
      updatedAt: new Date("2022-10-20 11:10"),
    };
    const mockUrl = `${process.env.BASE_URL}/reset-password/${mockUser.id}/execute/${mockUser.passResetHash}`;

    await sendVerifyMail(mockUser);

    expect(sendMail).toHaveBeenCalledWith(
      "mock-email",
      "[recordViscera]メールアドレス認証",
      `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${mockUrl}`
    );
  });
});

describe("sendVerifyMailErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("Errorが投げられたらinternalServerErrorHandleを実行", () => {
    try {
      throw new Error("message");
    } catch (e) {
      sendVerifyMailErrorHandle(e, mockReq as Request, mockRes as Response, 1);
    }

    expect(internalServerErrorHandle).toHaveBeenCalledWith(
      new Error("message"),
      1,
      mockReq,
      mockRes,
      "prepareResettingPassword"
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      try {
        throw "message";
      } catch (e) {
        sendVerifyMailErrorHandle(
          e,
          mockReq as Request,
          mockRes as Response,
          1
        );
      }
    };

    // 確認
    expect(test).toThrow("message");
  });

  test("Errorクラスのサブクラスを受けても再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      try {
        throw new DbRecordNotFoundError("message");
      } catch (e) {
        sendVerifyMailErrorHandle(
          e,
          mockReq as Request,
          mockRes as Response,
          1
        );
      }
    };

    // 確認
    expect(test).toThrow(new DbRecordNotFoundError("message"));
  });
});

describe("sendResponseのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("正常に動作", () => {
    sendResponse(mockReq as Request, mockRes as Response);

    expect(basicHttpResponce).toHaveBeenCalledWith(
      mockRes,
      201,
      true,
      "パスワードリセットのためのメールが送信されました。"
    );
    expect(logResponse).toHaveBeenCalledWith(
      "unspecified",
      mockReq,
      201,
      "パスワードリセットのためのメールが送信されました。",
      "prepareResettingPassword"
    );
  });
});
