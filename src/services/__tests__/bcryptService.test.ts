import { compareSync } from "bcrypt";
import { createHashedPass } from "@/services/bcryptService";

describe("createHashedPassの単体テスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("正常", () => {
    // テスト対象実行
    const password = "password";
    const hash = createHashedPass(password);

    // 生成されたhashと平文が同一かチェック
    const result = compareSync(password, hash);
    expect(result).toBe(true);
  });

  test("passwordがセットされていない", () => {
    // テスト対象実行
    const password = "";

    // 対象のエラーが投げられる
    expect(() => createHashedPass(password)).toThrow(
      "createHashedPass: passwordがありません",
    );
  });
});
