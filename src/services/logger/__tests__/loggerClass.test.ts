import { CustomLogger } from "@/services/logger/loggerClass";
import { LoggingObjType } from "../loggerService";
import fs from "fs";

describe("CustomLoggerクラスのテスト", () => {
  const timestampFormat = "YYYY-MM-DDThh:mm:ss.mmmZ";
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("constructorが正しく実行されているか", () => {
    const winston = require("winston");
    const spy = jest.spyOn(winston, "createLogger");
    // テスト対象実行
    new CustomLogger();

    expect(spy).toHaveBeenCalled();
  });

  test("logメソッドが正しく実行されているか", async () => {
    const mockMessage = "CustomLoggerクラスのテスト";
    const mockObj = {
      test: "test",
    };

    // テスト対象実行
    const logger = new CustomLogger();
    logger.log(mockMessage, mockObj);

    // ファイル書き込みが完了するまで待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // log/combined.log
    const loggedCombinedMessage = JSON.parse(
      fs.readFileSync("log/combined.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedCombinedMessage.level).toBe("info");
    expect(loggedCombinedMessage.message).toBe(mockMessage);
    expect(loggedCombinedMessage.service).toBe("user-service");
    expect(loggedCombinedMessage.test).toBe("test");
    expect(loggedCombinedMessage.timestamp).toHaveLength(
      timestampFormat.length,
    );

    // log/debug.log
    const loggedDebugMessage = JSON.parse(
      fs.readFileSync("log/debug.log", "utf8").split("\n").slice(-2)[0],
    );
    expect(loggedDebugMessage.level).toBe("info");
    expect(loggedDebugMessage.message).toBe(mockMessage);
    expect(loggedDebugMessage.service).toBe("user-service");
    expect(loggedDebugMessage.test).toBe("test");
    expect(loggedDebugMessage.timestamp).toHaveLength(timestampFormat.length);
  });

  test("errorメソッドが正しく実行されているか", async () => {
    const mockMessage = "CustomLoggerクラスのテスト";
    const mockObj: LoggingObjType = {
      userId: 1,
      ipAddress: "error-ip",
      method: "error-method",
      path: "error-path",
      body: "error-body",
      status: "error-status",
      responseMsg: "error-message",
    };

    // テスト対象実行
    const logger = new CustomLogger();
    logger.error(mockMessage, mockObj);

    // ファイル書き込みが完了するまで待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // log/combined.log
    const loggedCombinedMessage = JSON.parse(
      fs.readFileSync("log/combined.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedCombinedMessage.userId).toBe(1);
    expect(loggedCombinedMessage.ipAddress).toBe("error-ip");
    expect(loggedCombinedMessage.method).toBe("error-method");
    expect(loggedCombinedMessage.path).toBe("error-path");
    expect(loggedCombinedMessage.body).toBe("error-body");
    expect(loggedCombinedMessage.status).toBe("error-status");
    expect(loggedCombinedMessage.responseMsg).toBe("error-message");

    // log/debug.log
    const loggedDebugMessage = JSON.parse(
      fs.readFileSync("log/debug.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedDebugMessage.userId).toBe(1);
    expect(loggedDebugMessage.ipAddress).toBe("error-ip");
    expect(loggedDebugMessage.method).toBe("error-method");
    expect(loggedDebugMessage.path).toBe("error-path");
    expect(loggedDebugMessage.body).toBe("error-body");
    expect(loggedDebugMessage.status).toBe("error-status");
    expect(loggedDebugMessage.responseMsg).toBe("error-message");

    // log/error.log
    const loggedErrorMessage = JSON.parse(
      fs.readFileSync("log/error.log", "utf8").split("\n").slice(-2)[0],
    );
    expect(loggedErrorMessage.userId).toBe(1);
    expect(loggedErrorMessage.ipAddress).toBe("error-ip");
    expect(loggedErrorMessage.method).toBe("error-method");
    expect(loggedErrorMessage.path).toBe("error-path");
    expect(loggedErrorMessage.body).toBe("error-body");
    expect(loggedErrorMessage.status).toBe("error-status");
    expect(loggedErrorMessage.responseMsg).toBe("error-message");
  });

  test("warnメソッドが正しく実行されているか", async () => {
    const mockMessage = "CustomLoggerクラスのテスト";

    // テスト対象実行
    const logger = new CustomLogger();
    logger.warn(mockMessage);

    // ファイル書き込みが完了するまで待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // log/combined.log
    const loggedCombinedMessage = JSON.parse(
      fs.readFileSync("log/combined.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedCombinedMessage.level).toBe("warn");
    expect(loggedCombinedMessage.message).toBe(mockMessage);
    expect(loggedCombinedMessage.service).toBe("user-service");
    expect(loggedCombinedMessage.timestamp).toHaveLength(
      timestampFormat.length,
    );

    // log/debug.log
    const loggedDebugMessage = JSON.parse(
      fs.readFileSync("log/debug.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedDebugMessage.level).toBe("warn");
    expect(loggedDebugMessage.message).toBe(mockMessage);
    expect(loggedDebugMessage.service).toBe("user-service");
    expect(loggedDebugMessage.timestamp).toHaveLength(timestampFormat.length);
  });

  test("debugメソッドが正しく実行されているか", async () => {
    const mockMessage = "CustomLoggerクラスのテスト";

    // テスト対象実行
    const logger = new CustomLogger();
    logger.debug(mockMessage);

    // ファイル書き込みが完了するまで待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // log/debug.log
    const loggedDebugMessage = JSON.parse(
      fs.readFileSync("log/debug.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedDebugMessage.level).toBe("debug");
    expect(loggedDebugMessage.message).toBe(mockMessage);
    expect(loggedDebugMessage.service).toBe("user-service");
    expect(loggedDebugMessage.timestamp).toHaveLength(timestampFormat.length);
  });

  test("verboseメソッドが正しく実行されているか", async () => {
    const mockMessage = "CustomLoggerクラスのテスト";

    // テスト対象実行
    const logger = new CustomLogger();
    logger.verbose(mockMessage);

    // ファイル書き込みが完了するまで待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // log/combined.log
    const loggedDebugMessage = JSON.parse(
      fs.readFileSync("log/debug.log", "utf8").split("\n").slice(-2)[0],
    );

    expect(loggedDebugMessage.level).toBe("verbose");
    expect(loggedDebugMessage.message).toBe(mockMessage);
    expect(loggedDebugMessage.service).toBe("user-service");
    expect(loggedDebugMessage.timestamp).toHaveLength(timestampFormat.length);
  });
});
