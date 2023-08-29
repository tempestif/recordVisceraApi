import { PrismaClient } from "@prisma/client";
import { createHashedPass } from "@/services/bcryptService";
import { offsetTimePrisma } from "./index"

const prisma = new PrismaClient()

/**
 * PrismaClientを拡張
 * user.create時にpasswordをhash化する。
 */
export const hashedPassHookprisma = offsetTimePrisma.$extends({
    name: "hashedPassHook",
    query: {
        user: {
            async create({ model, operation, args, query }) {
                const password = args.data.password
                args.data.password = await createHashedPass(password)

                return query(args)
            }
        }
    }
})