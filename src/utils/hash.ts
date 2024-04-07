import { genSaltSync, hashSync } from "bcrypt";
import { randomBytes } from "crypto";

/**
 * パスワードをbcryptでhash化
 * @param password hash化するパスワード
 * @returns hash化されたパスワード
 */
export const createHashedPass = (password: string) => {
  if (!password) {
    throw new Error("createHashedPass: passwordがありません");
  }

  const salt = genSaltSync();
  const hashedPassword = hashSync(password, salt);

  return hashedPassword;
};

/**
 * ハッシュを生成
 * 32桁, hex
 * @returns
 */
export const createHash = () => {
  return randomBytes(32).toString("hex");
};
