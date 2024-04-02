import { PrismaClient } from "@prisma/client";

/**
 * 指定した時間だけ日時をずらす
 * 返り値ではなく、渡したオブジェクトが変更される
 * objectの値をすべて検査し、Date型の値をoffsetTime(ms)だけずらす
 * @param object
 * @param offsetTime ずらしたい時間(ms)
 * @returns
 */
export const setOffsetTime = (object: any, offsetTime: number) => {
    if (object === null || typeof object !== 'object') return

    // オブジェクトの値の型を見て、Date型だったらoffsetする
    for (const key of Object.keys(object)) {
        const value = object[key]
        if (value instanceof Date) {
            object[key] = new Date(value.getTime() + offsetTime)
        } else if (value !== null && typeof value === 'object') {
            setOffsetTime(value, offsetTime)
        }
    }
}
