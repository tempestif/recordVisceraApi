import * as read from "@/services/users/dailyReport/endpoints/read";
import {
  createSelectForPrisma,
  createSortsForPrisma,
} from "@/utils/dataTransfer";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import { BadRequestError } from "@/utils/errorHandle/errors";
import { customizedPrisma } from "@/utils/prismaClients";
import { omitExceptFilters } from "@/utils/utilRequest";
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
      findMany: jest.fn().mockImplementation(
        (arg: Prisma.Daily_ReportFindManyArgs) =>
          new Promise((resolve, reject) => {
            if (arg.where?.userId === 90) {
              // エラー
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

jest.mock("@/utils/utilRequest", () => ({
  ...jest.requireActual("@/utils/utilRequest"),
  omitExceptFilters: jest.fn().mockImplementation(() => ({
    id: 1,
  })),
}));

jest.mock("@/utils/dataTransfer", () => ({
  ...jest.requireActual("@/utils/dataTransfer"),
  createSelectForPrisma: jest.fn().mockImplementation(() => ({
    temp: "asc",
  })),
  createSortsForPrisma: jest.fn().mockImplementation(() => ({
    weight: true,
  })),
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
      "registDailyReport",
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

describe("createFiltersのテスト", () => {
  test("正常", () => {
    const query: Partial<read.VerifiedRequestType["query"]> = {
      id: 1,
      fields: ["id"],
    };
    const result = read.createFilters(
      query as read.VerifiedRequestType["query"],
    );

    expect(omitExceptFilters).toHaveBeenCalledWith({
      id: 1,
      fields: ["id"],
    });
    expect(result).toBe({ id: 1 });
  });
});

describe("getDailyReportsのテスト", () => {
  test("正常", async () => {
    const filters: Omit<
      read.VerifiedRequestType["query"],
      "fields" | "sorts" | "limit" | "offset"
    > = {
      id: 1,
      date: undefined,
      temp: 1,
      weight: 1,
      stomachach: 1,
      condition: 1,
      arthritis: 1,
      skinLesitions: 1,
      ocularLesitions: 1,
      fistulaAnorectalLesitions: 1,
      othersAnorectalLesitions: 1,
      abdominal: 1,
      createdAt: undefined,
      updatedAt: undefined,
    };
    const fields: read.VerifiedRequestType["query"]["fields"] = ["temp"];
    const sorts: read.VerifiedRequestType["query"]["sorts"] = ["weight"];
    const offset: read.VerifiedRequestType["query"]["offset"] = 3;
    const limit: read.VerifiedRequestType["query"]["limit"] = 5;
    const result = await read.getDailyReports(
      1,
      filters,
      fields,
      sorts,
      offset,
      limit,
    );

    expect(customizedPrisma.daily_Report.findMany).toHaveBeenCalledWith({
      orderBy: {
        weight: true,
      },
      where: {
        userId: 1,
        id: 1,
        date: undefined,
        temp: 1,
        weight: 1,
        stomachach: 1,
        condition: 1,
        arthritis: 1,
        skinLesitions: 1,
        ocularLesitions: 1,
        fistulaAnorectalLesitions: 1,
        othersAnorectalLesitions: 1,
        abdominal: 1,
        createdAt: undefined,
        updatedAt: undefined,
      },
      skip: 3,
      take: 5,
      select: {
        temp: "asc",
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
    expect(createSortsForPrisma).toHaveBeenCalledWith(["weight"]);
    expect(createSelectForPrisma).toHaveBeenCalledWith(["temp"]);
    expect(result).toBe({
      id: 1,
      day: new Date("2023-10-11"),
      userId: 1,
      createdAt: new Date("2022-11-11"),
      updatedAt: new Date("2022-11-11"),
    });
  });

  test("getDailyReportsが失敗したらPrismaClientKnownRequestError", async () => {
    const filters: Omit<
      read.VerifiedRequestType["query"],
      "fields" | "sorts" | "limit" | "offset"
    > = {
      id: 1,
      date: undefined,
      temp: 1,
      weight: 1,
      stomachach: 1,
      condition: 1,
      arthritis: 1,
      skinLesitions: 1,
      ocularLesitions: 1,
      fistulaAnorectalLesitions: 1,
      othersAnorectalLesitions: 1,
      abdominal: 1,
      createdAt: undefined,
      updatedAt: undefined,
    };
    const fields: read.VerifiedRequestType["query"]["fields"] = ["temp"];
    const sorts: read.VerifiedRequestType["query"]["sorts"] = ["weight"];
    const offset: read.VerifiedRequestType["query"]["offset"] = 3;
    const limit: read.VerifiedRequestType["query"]["limit"] = 5;

    const test = async () => {
      await read.getDailyReports(90, filters, fields, sorts, offset, limit);
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

describe("getDailyReportsErrorHandleのテスト", () => {
  const mockReq: Partial<Request> = {};
  const mockRes: Partial<Response> = {};
  test("PrismaClientKnownRequestErrorを受けたらdbRecordNotFoundErrorHandleが実行される", () => {
    read.getDailyReportsErrorHandle(
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
      "readDailyReport",
    );
  });

  test("それ以外のエラーだったらそのまま投げられる", () => {
    const test = () => {
      read.getDailyReportsErrorHandle(
        new Error("message"),
        1,
        mockReq as Request,
        mockRes as Response,
      );
    };

    expect(test).toThrow(new Error("message"));
  });
});
