import { genSaltSync, hashSync } from "bcrypt";

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
