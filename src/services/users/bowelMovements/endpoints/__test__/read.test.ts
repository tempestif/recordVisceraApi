import * as read from "@/services/users/bowelMovements/endpoints/read";
import {
  createSelectForPrisma,
  createSortsForPrisma,
} from "@/utils/dataTransfer";
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
    user: {
      findUniqueOrThrow: jest
        .fn()
        .mockImplementation((arg: Prisma.UserFindUniqueOrThrowArgs) => {
          if (arg.where.id === 80) {
            throw new Prisma.PrismaClientKnownRequestError("message", {
              code: "mock-code",
              clientVersion: "mock-version",
              batchRequestIdx: 1,
            });
          }
        }),
    },
    bowel_Movement: {
      findMany: jest
        .fn()
        .mockImplementation((arg: Prisma.Bowel_MovementFindManyArgs) => {
          if (arg.where?.userId === 90) {
            // 取得処理でこけた
            throw new Prisma.PrismaClientKnownRequestError("message", {
              code: "mock-code",
              clientVersion: "mock-version",
              batchRequestIdx: 1,
            });
          } else {
            const bowelMovement = {
              id: 1,
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
          }
        }),
      count: jest.fn().mockImplementation(
        (arg: Prisma.Bowel_MovementCountArgs) =>
          new Promise((resolve, reject) => {
            if (arg.where?.userId === 95) {
              reject(
                new Prisma.PrismaClientKnownRequestError("message", {
                  code: "mock-code",
                  clientVersion: "mock-version",
                  batchRequestIdx: 1,
                }),
              );
            } else {
              resolve(10);
            }
          }),
      ),
    },
  },
}));
jest.mock("@/utils/dataTransfer", () => ({
  createSortsForPrisma: jest
    .fn()
    .mockImplementation(() => "createSortsForPrisma"),
  createSelectForPrisma: jest
    .fn()
    .mockImplementation(() => "createSelectForPrisma"),
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
    read.validationErrorHandle(
      new BadRequestError("message"),
      mockReq as Request,
      mockRes as Response,
    );

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "readBowelMovements",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      read.validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("getBowelMovementsのテスト", () => {
  test("正常", async () => {
    const result = await read.getBowelMovements(1, {
      fields: ["blood", "bristolStoolScale"],
      sorts: ["-blood"],
      limit: 1,
      offset: 1,
      id: 1,
      date: undefined,
      blood: undefined,
      drainage: 2,
      note: undefined,
      bristolStoolScale: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });

    await expect(customizedPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    await expect(customizedPrisma.bowel_Movement.findMany).toHaveBeenCalledWith(
      {
        orderBy: "createSortsForPrisma",
        where: {
          userId: 1,
          id: 1,
          drainage: 2,
        },
        skip: 1,
        take: 1,
        select: "createSelectForPrisma",
      },
    );
    expect(createSortsForPrisma).toHaveBeenCalledWith(["-blood"]);
    expect(createSelectForPrisma).toHaveBeenCalledWith([
      "blood",
      "bristolStoolScale",
    ]);
    expect(result).toEqual({
      id: 1,
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
  });

  test("userがいない場合はPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await read.getBowelMovements(80, {
        fields: ["blood", "bristolStoolScale"],
        sorts: ["-blood"],
        limit: 1,
        offset: 1,
        id: 1,
        date: undefined,
        blood: undefined,
        drainage: 2,
        note: undefined,
        bristolStoolScale: undefined,
        createdAt: undefined,
        updatedAt: undefined,
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

  test("findManyでエラーだったらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await read.getBowelMovements(90, {
        fields: ["blood", "bristolStoolScale"],
        sorts: ["-blood"],
        limit: 1,
        offset: 1,
        id: 1,
        date: undefined,
        blood: undefined,
        drainage: 2,
        note: undefined,
        bristolStoolScale: undefined,
        createdAt: undefined,
        updatedAt: undefined,
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

describe("getBowelMovementsErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    read.getBowelMovementsErrorHandle(
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
      "readBowelMovements",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      read.getBowelMovementsErrorHandle(
        new Error("message"),
        1,
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("getAllCountのテスト", () => {
  test("正常", async () => {
    const result = await read.getAllCount(1);

    expect(customizedPrisma.bowel_Movement.count).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(result).toEqual(10);
  });

  test("countで失敗したらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await read.getAllCount(95);
    };

    expect(test).rejects.toThrow(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
    );
  });
});

describe("getAllCountErrorHandleのテスト", () => {
  beforeEach(() => {
    jest.resetAllMocks(); // テストの実行前にモックをリセット
  });
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    read.getAllCountErrorHandle(
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
      "readBowelMovements",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      read.getAllCountErrorHandle(
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
  const mockReq: Partial<read.VerifiedRequestType> = {
    query: {
      fields: ["blood", "bristolStoolScale"],
      sorts: ["-blood"],
      limit: 1,
      offset: 1,
      id: 1,
      date: undefined,
      blood: undefined,
      drainage: 2,
      note: undefined,
      bristolStoolScale: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    },
  };
  const mockRes: Partial<Response> = {};
  test("正常に動作", () => {
    read.sendResponse(
      1,
      mockReq as read.VerifiedRequestType,
      mockRes as Response,
      [
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
      ],
      10,
    );

    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "排便記録のリストを取得しました。",
      {
        allCount: 10,
        count: 1,
        sort: ["-blood"],
        fields: ["blood", "bristolStoolScale"],
        limit: 1,
        offset: 1,
        filter: {
          id: 1,
          date: null,
          blood: null,
          drainage: 2,
          note: null,
          bristolStoolScale: null,
          createdAt: null,
          updatedAt: null,
        },
        bowelMovements: [
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
        ],
      },
    );
    expect(logResponse).toHaveBeenCalledWith(
      1,
      mockReq,
      200,
      "排便記録のリストを取得しました。",
      "readBowelMovements",
    );
  });
});
