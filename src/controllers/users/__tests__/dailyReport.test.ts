import { createDailyReport } from "@/services/users/dailyReports";
import { findUniqueUserAbsoluteExist } from "@/services/users/users";
import type { Request, Response } from "express";
import { customizedPrisma } from "@/utils/prismaClients";
import { logResponse } from "@/utils/logger/utilLogger";
import { basicHttpResponceIncludeData } from "@/utils/utilResponse";
import { registDailyReport } from "@/controllers/users/dailyReport";
jest.mock("@/services/users/users", () => ({
  ...jest.requireActual("@/services/users/users"),
  findUniqueUserAbsoluteExist: jest.fn(),
}));
jest.mock("@/utils/utilResponse", () => ({
  ...jest.requireActual("@/utils/utilResponse"),
  basicHttpResponceIncludeData: jest.fn(),
}));
jest.mock("@/utils/logger/utilLogger", () => ({
  ...jest.requireActual("@/utils/logger/utilLogger"),
  logResponse: jest.fn(),
}));
jest.mock("@/services/users/dailyReports", () => ({
  ...jest.requireActual("@/services/users/dailyReports"),
  createDailyReport: jest.fn().mockImplementation(() => ({
    id: 1,
    note: "mock-note",
    day: new Date("2023-10-13T17:40:33.000Z"),
    time: new Date("2023-10-13T17:40:33.000Z"),
    temp: "36.5",
    weight: "50.5",
    stomachach: "1",
    condition: "1",
    arthritis: "1",
    skinLesitions: "1",
    ocularLesitions: "1",
    anirectalLesitions: "1",
    anirectalOtherLesitions: "1",
    abdominal: "1",
    userId: 10,
    createdAt: new Date("2023-11-01T07:01:13.000Z"),
    updatedAt: new Date("2023-11-11T07:01:13.000Z"),
  })),
}));

describe("registDailyReportのテスト", () => {
  let mockReq: Partial<Request>;
  const mockRes: Partial<Response> = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: {},
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", async () => {
    mockReq = {
      ip: "mock-ip",
      method: "mock-method",
      path: "mock-path",
      body: {
        userId: "10",
        date: "2023-10-13T17:40:33.000Z",
        temp: "36.5",
        weight: "50.5",
        stomachach: "1",
        condition: "1",
        arthritis: "1",
        skinLesitions: "1",
        ocularLesitions: "1",
        anirectalLesitions: "1",
        anirectalOtherLesitions: "1",
        abdominal: "1",
      },
    };

    // テスト対象実行
    await registDailyReport(mockReq as Request, mockRes as Response, next);

    // 確認
    expect(findUniqueUserAbsoluteExist).toHaveBeenCalledWith(
      { id: 10 },
      customizedPrisma
    );

    expect(createDailyReport).toHaveBeenCalledWith(
      10,
      new Date("2023-10-13T17:40:33.000Z"),
      {
        temp: "36.5",
        weight: "50.5",
        stomachach: "1",
        condition: "1",
        arthritis: "1",
        skinLesitions: "1",
        ocularLesitions: "1",
        anirectalLesitions: "1",
        anirectalOtherLesitions: "1",
        abdominal: "1",
      }
    );

    const httpStatus = 200;
    const responseStatus = true;
    const responseMsg = "今日の体調を記録しました。";
    expect(basicHttpResponceIncludeData).toHaveBeenCalledWith(
      mockRes,
      httpStatus,
      responseStatus,
      responseMsg,
      {
        id: 1,
        note: "mock-note",
        day: new Date("2023-10-13T17:40:33.000Z"),
        time: new Date("2023-10-13T17:40:33.000Z"),
        temp: "36.5",
        weight: "50.5",
        stomachach: "1",
        condition: "1",
        arthritis: "1",
        skinLesitions: "1",
        ocularLesitions: "1",
        anirectalLesitions: "1",
        anirectalOtherLesitions: "1",
        abdominal: "1",
        userId: 10,
        createdAt: new Date("2023-11-01T07:01:13.000Z"),
        updatedAt: new Date("2023-11-11T07:01:13.000Z"),
      }
    );

    expect(logResponse).toHaveBeenCalledWith(
      10,
      mockReq,
      httpStatus,
      responseMsg,
      "registDailyReport"
    );
  });
});
