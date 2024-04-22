export type FilterOptionsType = {
  [key: string]: {
    data: any;
    constructor: (i: string) => any;
  };
};

/**
 * filterOptionsから、データがstringの(=paramsにデータが存在する)フィールドだけオブジェクトにして返す
 * filterOptionsのコンストラクタを用いてキャストも行う
 * @param filterOptions フィルターの値と型のコンストラクタ
 * @returns
 */
export const createFilterForPrisma = (filterOptions: FilterOptionsType) => {
  // フィルターとして指定されたフィールドだけ、適するオブジェクトに変換してfilterに追加
  const filter: { [key: string]: any } = {};
  Object.keys(filterOptions).forEach((key) => {
    // クエリから受け取った値
    const data = filterOptions[key].data;

    // paramsにデータが存在することを確認
    if (typeof data === "string") {
      // 指定した型にキャスト
      const objForFilter = filterOptions[key].constructor(
        filterOptions[key].data,
      );
      filter[key] = objForFilter;
    }
  });
  return filter;
};

/**
 * paramsから渡されたソートの情報をPrismaのorderByで使えるオブジェクトに変換する
 * カンマ区切りで配列化、先頭に"-"があればdesc, 無ければascとして扱う
 * @param sort paramsから渡されたsort
 * @returns
 */
export const createSortsForPrisma = <
  FieldName extends string,
  MinFieldName extends string,
>(
  sorts: (FieldName | MinFieldName)[] | undefined,
) => {
  // sortに何も指定が無いなら何も指定しない(=空のオブジェクトでPrisma実行)
  if (!sorts) return {};

  // 指定されたソートの内容をprismaに渡せるように成型
  const orderBy: { [key: string]: "desc" | "asc" }[] = [];
  sorts.forEach((sort) => {
    if (sort.startsWith("-")) {
      const property = sort.slice(1);
      orderBy.push({
        [property]: "desc",
      });
    } else {
      orderBy.push({
        [sort]: "asc",
      });
    }
  });
  return orderBy;
};

/**
 * paramsから渡された、返却してほしいフィールドの情報をPrismaのselectで使えるオブジェクトに変換する
 * 指定されたものをキーに、値にtrueをセットしたオブジェクトを返却する
 * @param fields 必要なフィールド
 * @returns
 */
export const createSelectForPrisma = <FieldName extends string>(
  fields: FieldName[] | undefined,
) => {
  // sortに何も指定が無いなら何も指定しない(=空のオブジェクトでPrisma実行)
  if (!fields) return {};

  // 指定されたフィールドを抽出
  const select: { [key: string]: true } = {};
  fields.forEach((field) => {
    if (field) {
      select[field] = true;
    }
  });

  return select;
};
