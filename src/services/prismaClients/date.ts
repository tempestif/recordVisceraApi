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

/**
 * オブジェクトのDateを全て現在のタイムゾーンに変更する。
 * ※ただ、Prismaを通してしまうので、APIレスポンスではタイムゾーン情報がUTCになってしまう。
 * @param object
 * @returns
 */
const transferTimeZoneOnlyDate = (object: any) => {
    if (object === null || typeof object !== 'object') return

    for (const key of Object.keys(object)) {
        const value = object[key]
        if (value instanceof Date) {
            toISOStringWithTimezone(value)
        } else if (value !== null && typeof value === 'object') {
            transferTimeZoneOnlyDate(value)
        }
    }
}

/**
 * 受け取ったDate型をタイムゾーン情報付きのISO 8601拡張形式で出力する
 * タイムゾーンの取得にはgetTimezoneOffset()を使っている。
 * @param date
 * @returns
 */
function toISOStringWithTimezone(date: Date): string {
    const pad = function (str: string): string {
        return ('0' + str).slice(-2);
    }
    const year = (date.getFullYear()).toString();
    const month = pad((date.getMonth() + 1).toString());
    const day = pad(date.getDate().toString());
    const hour = pad(date.getHours().toString());
    const min = pad(date.getMinutes().toString());
    const sec = pad(date.getSeconds().toString());
    const tz = -date.getTimezoneOffset();
    const sign = tz >= 0 ? '+' : '-';
    const tzHour = pad((tz / 60).toString());
    const tzMin = pad((tz % 60).toString());

    const IsoFormat = `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${tzHour}:${tzMin}`
    return IsoFormat
}

const prisma = new PrismaClient()

/**
 * PrismaClientを拡張
 * タイムゾーンをJSTに変更する。
 * TODO: フロントの調子(JSの仕様)を見てどっちにするか決める。-offsetのsetOffsetTimeを消すだけでもほとんど同じような動作をするはず。
 * setOffsetTime(result, -offsetTime): JSTで入力→DBに入力+9:00(UTC)で書き込み→DB-9:00(UTC)で返却
 * transferTimeZoneOnlyDate(result): JSTで入力→DBに入力+9:00(UTC)で書き込み→DB(UTC)=JSTでの時間(UTC)の状態で返却
 */
export const offsetTimePrisma = prisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const offsetTime = 9 * 60 * 60 * 1000

                setOffsetTime(args, offsetTime)
                const result = await query(args)
                // setOffsetTime(result, -offsetTime)
                transferTimeZoneOnlyDate(result)

                return result
            }
        }
    }
})