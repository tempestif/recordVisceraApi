import { Prisma, PrismaClient } from "@prisma/client";
import { setOffsetTime } from "./date";
import { createHashedPass } from "@/services/bcryptService";

const prisma = new PrismaClient();

const extention = Prisma.defineExtension({
    name: "customizedPrisma",
    query: {
        // PrismaClientを拡張

        // user.create時にpasswordをhash化する。
        user: {
            // create, createMany
            async create({ model, operation, args, query }) {
                const password = args.data.password;
                args.data.password = await createHashedPass(password);

                return query(args);
            },
            async createMany({ model, operation, args, query }) {
                if (Array.isArray(args.data)) {
                    for (let i = 0; i < args.data.length; i++) {
                        const password = args.data[i].password;
                        args.data[i].password = await createHashedPass(
                            password
                        );
                    }
                } else {
                    const password = args.data.password;
                    args.data.password = await createHashedPass(password);
                }

                return query(args);
            },

            // update, updateMany
            async update({ model, operation, args, query }) {
                const password = args.data.password;
                // updateするデータの中にpasswordがあったら
                if (typeof password === "string") {
                    args.data.password = await createHashedPass(password);
                }

                return query(args);
            },
            async updateMany({ model, operation, args, query }) {
                // updateManyは配列で渡すわけじゃないからこの条件分岐でOK
                // https://www.prisma.io/docs/orm/reference/prisma-client-reference#updatemany-1

                const password = args.data.password;
                // updateするデータの中にpasswordがあったら
                if (typeof password === "string") {
                    args.data.password = await createHashedPass(password);
                }

                return query(args);
            },

            // upsert
            async upsert({ model, operation, args, query }) {
                const updatedPasswordData = args.update.password;
                const createdPasswordData = args.create.password;

                if (updatedPasswordData === "string") {
                    args.update.password = await createHashedPass(
                        updatedPasswordData
                    );
                }

                if (createdPasswordData === "string") {
                    args.update.password = await createHashedPass(
                        createdPasswordData
                    );
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
