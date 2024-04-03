import { sign } from "jsonwebtoken";

/**
 * userのidをもとにjwtを発行
 * 有効期限は7日
 * @param id
 * @returns jwt
 */
export const generateAuthToken = (id: number) => {
  // PrivateKeyがないときはtoken作れなくする
  const privateKey = process.env.JWTPRIVATEKEY;
  if (!privateKey) {
    throw new Error("generateAuthToken: 環境変数が足りません");
  }

  const token = sign({ id }, privateKey, {
    expiresIn: "7d",
  });
  return token;
};
