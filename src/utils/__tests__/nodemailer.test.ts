import { sendMail } from "@/utils/nodemailer";
import { createTransport } from "nodemailer";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn(),
  })),
}));

describe("sendMailのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", async () => {
    const to = "petaxaviscera@gmail.com";
    const subject = "sendMailのテスト";
    const text = "正常";
    await sendMail(to, subject, text);

    expect(createTransport).toHaveBeenCalledWith({
      service: "Gmail",
      auth: {
        user: "petaxaviscera@gmail.com",
        pass: "xtjdfjwnavudetgk",
      },
    });
    const transport = (createTransport as jest.Mock).mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledWith({
      from: "petaxaviscera@gmail.com",
      to,
      subject,
      text,
    });
  });

  test("MAIL_ACCOUNTがない", async () => {
    // MAIL_ACCOUNTをmock化
    const originalEnvVar = process.env.MAIL_ACCOUNT;
    process.env.MAIL_ACCOUNT = "";

    try {
      const to = "petaxaviscera@gmail.com";
      const subject = "sendMailのテスト";
      const text = "MAIL_ACCOUNTがない";

      await expect(sendMail(to, subject, text)).rejects.toThrow(
        "sendMail: 環境変数が足りません"
      );
    } finally {
      process.env.MAIL_ACCOUNT = originalEnvVar;
    }
  });

  test("MAIL_PASSWORDがない", async () => {
    // MAIL_PASSWORDをmock化
    const originalEnvVar = process.env.MAIL_PASSWORD;
    process.env.MAIL_PASSWORD = "";

    try {
      const to = "petaxaviscera@gmail.com";
      const subject = "sendMailのテスト";
      const text = "MAIL_PASSWORDがない";

      await expect(sendMail(to, subject, text)).rejects.toThrow(
        "sendMail: 環境変数が足りません"
      );
    } finally {
      process.env.MAIL_PASSWORD = originalEnvVar;
    }
  });

  test("MAIL_ACCOUNT, MAIL_PASSWORDがない", async () => {
    // MAIL_ACCOUNT, MAIL_PASSWORDをmock化
    const originalEnvAcc = process.env.MAIL_ACCOUNT;
    const originalEnvPass = process.env.MAIL_PASSWORD;
    process.env.MAIL_ACCOUNT = "";
    process.env.MAIL_PASSWORD = "";

    try {
      const to = "petaxaviscera@gmail.com";
      const subject = "sendMailのテスト";
      const text = "MAIL_ACCOUNT, MAIL_PASSWORDがない";

      await expect(sendMail(to, subject, text)).rejects.toThrow(
        "sendMail: 環境変数が足りません"
      );
    } finally {
      process.env.MAIL_ACCOUNT = originalEnvAcc;
      process.env.MAIL_PASSWORD = originalEnvPass;
    }
  });
});
