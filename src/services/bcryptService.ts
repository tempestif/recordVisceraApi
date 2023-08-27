import { genSaltSync, hashSync } from "bcrypt";


export const createHashedPass = async(password: string) => {
    const rawPassword = password
    const salt = genSaltSync();
    const hashedPassword = await hashSync(rawPassword, salt)

    return hashedPassword
}