import * as regist from "@/services/users/dailyReport/endpoints/regist";
import { badRequestErrorHandle } from "@/utils/errorHandle/errorHandling";
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
    daily_Report: {
      create: jest.fn().mockImplementation(
        (arg: Prisma.Daily_ReportCreateArgs) =>
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
              const dailyReport = {
                id: 1,
                day: new Date("2023-10-11"),
                userId: 1,
                createdAt: new Date("2022-11-11"),
                updatedAt: new Date("2022-11-11"),
              };
              resolve(dailyReport);
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
      "registDailyReport",
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

describe("createDailyReportのテスト", () => {
  test("正常", async () => {
    const result = await regist.createDailyReport(1, {
      date: new Date("2022-11-11"),
      temp: 10.5,
      weight: 20.5,
      stomachach: 4,
      condition: 5,
      arthritis: 0,
      skinLesitions: 1,
      ocularLesitions: undefined,
      fistulaAnorectalLesitions: 10,
      othersAnorectalLesitions: 20,
      abdominal: 3,
    });

    await expect(customizedPrisma.daily_Report.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        day: new Date("2022-11-11"),
        Temp: {
          create: {
            result: 10.5,
          },
        },
        Weight: {
          create: {
            result: 20.5,
          },
        },
        Stomachache: {
          create: {
            stomachache_Scale_TypesId: 4,
          },
        },
        Condition: {
          create: {
            condition_Scale_TypesId: 5,
          },
        },
        Arthritis: {
          create: {
            result: 0,
          },
        },
        Skin_Lesions: {
          create: {
            result: 1,
          },
        },
        Ocular_Lesitions: {
          create: {
            result: undefined,
          },
        },
        Anorectal_Lesitions: {
          create: {
            fistula: 10,
            others: 20,
          },
        },
        Abdominal: {
          create: {
            abdominal_Scale_TypesId: 3,
          },
        },
      },
      include: {
        Temp: true,
        Weight: true,
        Stomachache: true,
        Condition: true,
        Arthritis: true,
        Skin_Lesions: true,
        Ocular_Lesitions: true,
        Anorectal_Lesitions: true,
        Abdominal: true,
      },
    });
    expect(result).toEqual({
      id: 1,
      day: new Date("2023-10-11"),
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
    });
  });

  test("createDailyReportが失敗したらPrismaClientKnownRequestError", async () => {
    const test = async () => {
      await regist.createDailyReport(90, {
        date: new Date("2022-11-11"),
        temp: 10.5,
        weight: 20.5,
        stomachach: 4,
        condition: 5,
        arthritis: 0,
        skinLesitions: 1,
        ocularLesitions: undefined,
        fistulaAnorectalLesitions: 10,
        othersAnorectalLesitions: 20,
        abdominal: 3,
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

describe("sendResponseのテスト", () => {
  test("正常", () => {
    const mockReq: Partial<Request> = {};
    const mockRes: Partial<Response> = {};
    regist.sendResponse(1, mockReq as Request, mockRes as Response, {
      id: 1,
      day: new Date("2023-10-11"),
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
      Temp: null,
      Weight: null,
      Stomachache: null,
      Condition: null,
      Arthritis: null,
      Skin_Lesions: null,
      Ocular_Lesitions: null,
      Anorectal_Lesitions: null,
      Abdominal: null,
    });

    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      200,
      true,
      "今日の体調を記録しました。",
      {
        id: 1,
        day: new Date("2023-10-11"),
        userId: 1,
        createdAt: new Date("2022-11-11"),
        updatedAt: new Date("2022-11-11"),
        Temp: null,
        Weight: null,
        Stomachache: null,
        Condition: null,
        Arthritis: null,
        Skin_Lesions: null,
        Ocular_Lesitions: null,
        Anorectal_Lesitions: null,
        Abdominal: null,
      },
    );
    expect(logResponse).toHaveBeenCalledWith(
      1,
      mockReq,
      200,
      "今日の体調を記録しました。",
      "registDailyReport",
    );
  });
});
