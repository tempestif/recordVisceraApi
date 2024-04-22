import * as del from "@/services/users/bowelMovements/endpoints/delete";
import {
  accessForbiddenErrorHandle,
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  AccessForbiddenError,
  BadRequestError,
} from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { basicHttpResponceIncludeData } from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

jest.mock("@/utils/errorHandle/errorHandling", () => ({
  ...jest.requireActual("@/utils/errorHandle/errorHandling"),
  badRequestErrorHandle: jest.fn(),
  accessForbiddenErrorHandle: jest.fn(),
  dbRecordNotFoundErrorHandle: jest.fn(),
}));

jest.mock("@/utils/prismaClients", () => ({
  customizedPrisma: {
    bowel_Movement: {
      findUniqueOrThrow: jest
        .fn()
        .mockImplementation(
          (arg: Prisma.Bowel_MovementFindUniqueOrThrowArgs) => {
            if (arg.where.id === 11 || arg.where.id === 91) {
              // 正常
              const bowelMovement = {
                id: 11,
                date: new Date("2022-11-11"),
                day: new Date("2022-11-11"),
                bristolStoolScale: 1,
                blood: 1,
                drainage: 1,
                note: "note",
                userId: 1,
                createdAt: new Date("2022-11-11"),
                updatedAt: new Date("2022-11-11"),
              };
              return bowelMovement;
            } else if (arg.where.id === 90) {
              // idに合致するレコードがなかった
              throw new Prisma.PrismaClientKnownRequestError("message", {
                code: "mock-code",
                clientVersion: "mock-version",
                batchRequestIdx: 1,
              });
            }
          },
        ),
      delete: jest
        .fn()
        .mockImplementation((arg: Prisma.Bowel_MovementDeleteArgs) => {
          if (arg.where.id === 11) {
            // 正常
            const bowelMovement = {
              id: 11,
              date: new Date("2022-11-11"),
              day: new Date("2022-11-11"),
              bristolStoolScale: 1,
              blood: 1,
              drainage: 1,
              note: "deleted",
              userId: 1,
              createdAt: new Date("2022-11-11"),
              updatedAt: new Date("2022-11-11"),
            };
            return bowelMovement;
          } else if (arg.where.id === 91) {
            // idに合致するレコードがなかった
            throw new Prisma.PrismaClientKnownRequestError("message", {
              code: "mock-code",
              clientVersion: "mock-version",
              batchRequestIdx: 1,
            });
          }
        }),
    },
  },
}));

jest.mock("@/utils/utilResponse", () => ({
  ...jest.requireActual("@/utils/utilResponse"),
  basicHttpResponceIncludeData: jest.fn(),
}));
jest.mock("@/utils/logger/utilLogger", () => ({
  ...jest.requireActual("@/utils/logger/utilLogger"),
  logResponse: jest.fn(),
}));

describe("validationErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("BadRequestErrorを受けたらbadRequestErrorHandleが実行される", () => {
    del.validationErrorHandle(
      new BadRequestError("message"),
      mockReq as Request,
      mockRes as Response,
    );

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "deleteBowelMovement",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      del.validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("deleteBowelMovementのテスト", () => {
  test("正常に取得できる", async () => {
    const result = await del.deleteBowelMovement(11, 1);

    expect(
      customizedPrisma.bowel_Movement.findUniqueOrThrow,
    ).toHaveBeenCalledWith({
      where: { id: 11 },
    });
    expect(customizedPrisma.bowel_Movement.delete).toHaveBeenCalledWith({
      where: { id: 11 },
    });
    expect(result).toEqual({
      id: 11,
      date: new Date("2022-11-11"),
      day: new Date("2022-11-11"),
      bristolStoolScale: 1,
      blood: 1,
      drainage: 1,
      note: "deleted",
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
    });
  });

  test("指定したbowelMovementが存在しなかったらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await del.deleteBowelMovement(90, 1);
    };

    await expect(test).rejects.toThrow(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
    );
  });

  test("指定したbowelMovementとuserIdが一致しなかったらAccessForbiddenError", async () => {
    const test = async () => {
      await del.deleteBowelMovement(11, 99);
    };

    await expect(test).rejects.toThrow(
      new AccessForbiddenError("この排便記録は編集できません"),
    );
  });

  test("削除に失敗したらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await del.deleteBowelMovement(91, 1);
    };

    await expect(test).rejects.toThrow(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
    );
  });
});

describe("deleteBowelMovementErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    del.deleteBowelMovementErrorHandle(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
      1,
      mockReq as Request,
      mockRes as Response,
    );

    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
      1,
      mockReq,
      mockRes,
      "deleteBowelMovement",
    );
  });

  test("AccessForbiddenErrorを受けたらaccessForbiddenErrorHandleが実行される", () => {
    del.deleteBowelMovementErrorHandle(
      new AccessForbiddenError("message"),
      1,
      mockReq as Request,
      mockRes as Response,
    );

    expect(accessForbiddenErrorHandle).toHaveBeenCalledWith(
      new AccessForbiddenError("message"),
      1,
      mockReq,
      mockRes,
      "deleteBowelMovement",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      del.validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("sendResponseのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("正常に動作", () => {
    del.sendResponse(1, mockReq as Request, mockRes as Response, {
      id: 11,
      date: new Date("2022-11-11"),
      day: new Date("2022-11-11"),
      bristolStoolScale: 1,
      blood: 1,
      drainage: 1,
      note: "deleted",
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
    });

    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "排便記録を削除しました。",
      {
        id: 11,
        date: new Date("2022-11-11"),
        day: new Date("2022-11-11"),
        bristolStoolScale: 1,
        blood: 1,
        drainage: 1,
        note: "deleted",
        userId: 1,
        createdAt: new Date("2022-11-11"),
        updatedAt: new Date("2022-11-11"),
      },
    );
    expect(logResponse).toHaveBeenCalledWith(
      1,
      mockReq,
      200,
      "排便記録を削除しました。",
      "deleteBowelMovement",
    );
  });
});
