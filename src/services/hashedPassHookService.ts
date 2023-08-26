import { PrismaClient } from "@prisma/client";
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

export const hashedPassHookprisma = prisma.$extends({
    name: "hashedPassHook",
    query: {
        user: {
            async create({ model, operation, args, query }) {
                const rowPassword = args.data.password
                const hashedPassword = await hash(rowPassword, 10)
                args.data.password = hashedPassword
                console.log(hashedPassword)

                return query(args)
            }
        }
    }
})