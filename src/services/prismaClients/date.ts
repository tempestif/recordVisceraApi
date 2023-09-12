import { PrismaClient } from "@prisma/client";

/**
 * 指定した時間だけ日時をずらす
 * @param object
 * @param offsetTime ずらしたい時間
 * @returns
 */
export const setOffsetTime = (object: any, offsetTime: number) => {
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
