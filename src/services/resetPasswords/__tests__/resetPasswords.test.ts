import { sendMail } from "@/utils/nodemailer";
import { sendMailForResetPasswordVerify } from "@/services/resetPasswords/resetPasswordsServices/resetPasswords";

jest.mock("@/utils/nodemailer", () => ({
  ...jest.requireActual("@/utils/nodemailer"),
  sendMail: jest.fn(),
}));

describe("sendMailForResetPasswordVerifyのテスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", async () => {
    const email = "mock-email";
    const url = "mock-url";
    await sendMailForResetPasswordVerify(email, url);

    expect(sendMail).toHaveBeenCalledWith(
      email,
      "[recordViscera]メールアドレス認証",
      "以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\nmock-url"
    );
  });
});
