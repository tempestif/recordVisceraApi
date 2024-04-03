// NOTE: 現在は利用していない。
// 生のSQLをJestPrismaで実行するためのクラス。
// 実行時にエラーになってしまって動かない

import { customizedPrisma } from "@/services/prismaClients";

/**
 * customizedPrismaとは独立したDB操作を行う
 * create, findを作成。必要であれば順次追加する
 * 実行時にエラーになってしまって動かない
 */
export class RowPrisma {
  prismaClient: typeof customizedPrisma;

  constructor(prismaClient: typeof customizedPrisma) {
    this.prismaClient = prismaClient;
  }

  /**
   * テーブル名と{カラム名: value}のオブジェクトから、挿入を行う
   * @param table 挿入先テーブル名(テーブル名なので、先頭大文字)
   * @param obj 挿入するレコードのValueオブジェクト
   */
  async create(table: string, obj: ObjType) {
    let values = "";
    let keys = "";
    // objを列名とvalueに分ける
    Object.keys(obj).forEach((key: string) => {
      keys += `${key},`;
      values += `${obj[key]},`;
    });

    const valuesStr = values.slice(0, -1);
    const keysStr = keys.slice(0, -1);

    await this.prismaClient
      .$queryRaw`INSERT INTO ${table} (${valuesStr}) VALUES (${keysStr})`;
    await this.prismaClient
      .$queryRaw`SELECT * FROM \`record-viscera-api\`.\`User\` (${valuesStr}) VALUES (${keysStr});`;
  }

  /**
   * テーブル名と{カラム名: value}のオブジェクトから検索を行う
   * SELECT * table where カラム名=value AND ...
   * @param table 挿入先テーブル名(テーブル名なので、先頭大文字)
   * @param where whereのカラム名, valueを設定
   */
  async find(table: string, whereObj: ObjType) {
    let where = "";
    Object.keys(whereObj).forEach((key: string) => {
      const str = `${key}=${whereObj[key]} AND `;
      where += str;
    });

    const whereStr = where.slice(0, -5);

    console.log(whereStr);

    // なぜかRaw query failed. Code: `1146`. Message: `Table 'record-viscera-api.user' doesn't exist`になっちゃう
    await this.prismaClient
      .$queryRaw`SELECT * FROM \`record-viscera-api\`.\`User\`;`;
  }
}

type ObjType = {
  [key: string]: any;
};
