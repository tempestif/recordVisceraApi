import * as regist from "@/services/users/bowelMovements/endpoints/regist";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import { BadRequestError } from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { basicHttpResponceIncludeData } from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

jest.mock("@/utils/errorHandle/errorHandling", () => ({
  ...jest.requireActual("@/utils/errorHandle/errorHandling"),
  badRequestErrorHandle: jest.fn(),
  dbRecordNotFoundErrorHandle: jest.fn(),
}));

jest.mock("@/utils/prismaClients", () => ({
  customizedPrisma: {
    bowel_Movement: {
      create: jest.fn().mockImplementation(
        (arg: Prisma.Bowel_MovementCreateArgs) =>
          new Promise((resolve, reject) => {
            if (arg.data.userId === 90) {
              reject(
                new Prisma.PrismaClientKnownRequestError("message", {
                  code: "mock-code",
                  clientVersion: "mock-version",
                  batchRequestIdx: 1,
                }),
              );
            } else {
              // 正常
              const bowelMovement = {
                id: 1,
                date: new Date("2023-10-11"),
                day: new Date("2023-10-11"),
                blood: 1,
                drainage: 2,
                note: "hoge",
                bristolStoolScale: 2,
                userId: 1,
                createdAt: new Date("2022-11-11"),
                updatedAt: new Date("2022-11-11"),
              };
              resolve(bowelMovement);
            }
          }),
      ),
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
    regist.validationErrorHandle(
      new BadRequestError("message"),
      mockReq as Request,
      mockRes as Response,
    );

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "registBowelMovement",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      regist.validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("createBowelMovementのテスト", () => {
  test("正常", async () => {
    const result = await regist.createBowelMovement(1, {
      date: new Date("2023-10-11"),
      blood: 1,
      drainage: 2,
      note: "hoge",
      bristolStoolScale: 2,
    });

    expect(customizedPrisma.bowel_Movement.create).toHaveBeenCalledWith({
      data: {
        date: new Date("2023-10-11"),
        day: new Date("2023-10-11"),
        blood: 1,
        drainage: 2,
        note: "hoge",
        bristolStoolScale: 2,
        userId: 1,
      },
    });
    expect(result).toEqual({
      id: 1,
      date: new Date("2023-10-11"),
      day: new Date("2023-10-11"),
      blood: 1,
      drainage: 2,
      note: "hoge",
      bristolStoolScale: 2,
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
    });
  });

  test("create失敗したらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await regist.createBowelMovement(90, {
        date: new Date("2023-10-11"),
        blood: 1,
        drainage: 2,
        note: "hoge",
        bristolStoolScale: 2,
      });
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

describe("createBowelMovementErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    regist.createBowelMovementErrorHandle(
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
      "registBowelMovement",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      regist.createBowelMovementErrorHandle(
        new Error("message"),
        1,
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
    regist.sendResponse(1, mockReq as Request, mockRes as Response, {
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
    });

    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "排便記録を記録しました。",
      {
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
      },
    );
    expect(logResponse).toHaveBeenCalledWith(
      1,
      mockReq,
      200,
      "排便記録を記録しました。",
      "registBowelMovement",
    );
  });
});
