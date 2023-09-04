import { PrismaClient } from "@prisma/client";

/**
 * 指定した時間だけ日時をずらす
 * @param object
 * @param offsetTime ずらしたい時間
 * @returns
 */
function setOffsetTime(object: any, offsetTime: number) {
    if (object === null || typeof object !== 'object') return

    for (const key of Object.keys(object)) {
        const value = object[key]
        if (value instanceof Date) {
            object[key] = new Date(value.getTime() + offsetTime)
        } else if (value !== null && typeof value === 'object') {
            setOffsetTime(value, offsetTime)
        }
    }
}

const prisma = new PrismaClient()

/**
 * PrismaClientを拡張
 * タイムゾーンをJSTに変更する。
 * JSTで入力→入力+9:00(UTC)でDBに書き込み→DBのデータ(入力+9:00(UTC))で返却
 */
export const offsetTimePrisma = prisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const offsetTime = 9 * 60 * 60 * 1000

                setOffsetTime(args, offsetTime)
                const result = await query(args)

                return result
            }
        }
    }
})