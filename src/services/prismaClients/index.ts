import { Prisma, PrismaClient } from "@prisma/client";
import { setOffsetTime } from "./date";
import { createHashedPass } from "@/services/bcryptService";

const prisma = new PrismaClient();

const extention = Prisma.defineExtension({
    name: "customizedPrisma",
    query: {
        // PrismaClientを拡張
        // タイムゾーンをJSTに変更する。
        // JSTで入力→入力+9:00(UTC)でDBに書き込み→DBのデータ(入力+9:00(UTC))で返却
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const offsetTime = 9 * 60 * 60 * 1000;

                setOffsetTime(args, offsetTime);
                const result = await query(args);

                return result;
            },
        },

        // user.create時にpasswordをhash化する。
        user: {
            async create({ model, operation, args, query }) {
                const password = args.data.password;
                args.data.password = await createHashedPass(password);

                return query(args);
            },
            async update({ model, operation, args, query }) {
                const password = args.data.password;
                if (typeof password === "string") {
                    args.data.password = await createHashedPass(password);
                }

                return query(args);
            },
        },

        // TODO: 医療情報を保存する際に暗号化、取得する際に復号する
    },
});

/**
 * PrismaClientを拡張
 * user.create時にpasswordをhash化する。
 */
export const customizedPrisma = prisma.$extends(extention);

