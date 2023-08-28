import { genSaltSync, hashSync } from "bcrypt";

/**
 * パスワードをbcryptでhash化
 * @param password hash化するパスワード
 * @returns hash化されたパスワード
 */
export const createHashedPass = async(password: string) => {
    const rawPassword = password
    const salt = genSaltSync();
    const hashedPassword = await hashSync(rawPassword, salt)

    return hashedPassword
}