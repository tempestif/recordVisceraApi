import type { JestPrisma } from "@quramy/jest-prisma-core";
import { customizedPrisma } from "@/services/prismaClients";
import { PrismaClient } from "@prisma/client";

declare global {
    var jestPrisma: JestPrisma<typeof customizedPrisma>;

    // TODO: カスタマイズしていないJestPrismaを使いたかった時のもの。
    // var rowJestPrisma: JestPrisma<PrismaClient>;
}
