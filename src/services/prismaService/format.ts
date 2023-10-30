import { Prisma } from "@prisma/client"
export const transformNameTableToModel = (tableName: keyof Prisma.TypeMap["model"]) => {
    // テーブル名はキャメルケース、prismaclientのプロパティはパスカルケース。
    // キャメルケースからパスカルケースへ変換

    // 先頭を小文字に変更
    const modelName = `${tableName[0].toLowerCase()}${tableName.slice(1)}` as Prisma.TypeMap['meta']['modelProps']
    return modelName
}