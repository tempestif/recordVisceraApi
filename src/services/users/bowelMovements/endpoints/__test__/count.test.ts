import * as count from "@/services/users/bowelMovements/endpoints/count";
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
            // userがいなかった
            throw new Prisma.PrismaClientKnownRequestError("message", {
              code: "mock-code",
              clientVersion: "mock-version",
              batchRequestIdx: 1,
            });
          }
        }),
    },
    bowel_Movement: {
      groupBy: jest
        .fn()
        .mockImplementation((arg: Prisma.Bowel_MovementGroupByArgs) => {
          if (arg.where?.userId === 1) {
            return [
              {
                day: new Date("2022-10-11"),
                _count: {
                  _all: 5,
                },
              },
              {
                day: new Date("2022-10-15"),
                _count: {
                  _all: 4,
                },
              },
            ];
          } else if (arg.where?.userId === 91) {
            // データ取得が失敗
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
    count.validationErrorHandle(
      new BadRequestError("message"),
      mockReq as Request,
      mockRes as Response,
    );

    expect(badRequestErrorHandle).toHaveBeenCalledWith(
      new BadRequestError("message"),
      "unspecified",
      mockReq,
      mockRes,
      "countBowelMovementsPerDay",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      count.validationErrorHandle(
        new Error("message"),
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});

describe("countDailyBowelMovementsのテスト", () => {
  test("正常に取得できる", async () => {
    const result = await count.countDailyBowelMovements(1);

    expect(customizedPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(customizedPrisma.bowel_Movement.groupBy).toHaveBeenCalledWith({
      by: ["day"],
      where: {
        userId: 1,
      },
      _count: {
        _all: true,
      },
    });
    expect(result).toEqual([
      { day: new Date("2022-10-11"), count: 5 },
      { day: new Date("2022-10-15"), count: 4 },
    ]);
  });

  test("userが見つからないときはPrismaClientKnownRequestErrorを投げる", async () => {
    const test = async () => {
      await count.countDailyBowelMovements(90);
    };

    await expect(test).rejects.toThrow(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
    );
  });

  test("groupByに失敗したらPrismaClientKnownRequestErrorを投げる", async () => {
    const test = async () => {
      await count.countDailyBowelMovements(91);
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

describe("countDailyBowelMovementsErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleを実行", () => {
    try {
      throw new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      });
    } catch (e) {
      count.countDailyBowelMovementsErrorHandle(
        e,
        1,
        mockReq as Request,
        mockRes as Response,
      );
    }

    expect(dbRecordNotFoundErrorHandle).toHaveBeenCalledWith(
      new Prisma.PrismaClientKnownRequestError("message", {
        code: "mock-code",
        clientVersion: "mock-version",
        batchRequestIdx: 1,
      }),
      1,
      mockReq as Request,
      mockRes as Response,
      "countBowelMovementsPerDay",
    );
  });

  test("それ以外のエラーを受けたら再度throwされる", () => {
    // throwされるものを確認したいのでwrapする
    const test = () => {
      count.countDailyBowelMovementsErrorHandle(
        new Error(),
        1,
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error());
  });
});

describe("sendResponseのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("正常に動作", () => {
    count.sendResponse(1, mockReq as Request, mockRes as Response, [
      { day: new Date("2022-10-11"), count: 5 },
      { day: new Date("2022-10-15"), count: 4 },
    ]);

    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "排便回数/日を集計しました。",
      {
        allCount: 9,
        counts: [
          { day: new Date("2022-10-11"), count: 5 },
          { day: new Date("2022-10-15"), count: 4 },
        ],
      },
    );
    expect(logResponse).toHaveBeenCalledWith(
      1,
      mockReq,
      200,
      "排便回数/日を集計しました。",
      "countBowelMovementsPerDay",
    );
  });
});
