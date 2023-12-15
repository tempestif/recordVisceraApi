import type { JestPrisma } from "@quramy/jest-prisma-core";
import { customizedPrisma } from "@/services/prismaClients";

declare global {
    var jestPrisma: JestPrisma<typeof customizedPrisma>;
}
