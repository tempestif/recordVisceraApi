import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import { Request } from "express";

export type QueryTypeBasedOnReadRequest<
  Fields extends string,
  Sorts extends string,
  Filters extends Record<string, string | number | Date | null | undefined>,
> = {
  fields: Fields[] | undefined;
  sorts: Sorts[] | undefined;
  limit: number | undefined;
  offset: number | undefined;
} & Filters;

/** 全ての型パラメータを受け付けるRequest型 */
export type AnyRequest = Request<any, any, any, any>;

/**
 * クエリのfield属性に対するテストを行い、カンマ区切りで分割した配列を返却
 * DBのカラム名と一致した値を入力しているかをチェック
 * @param value
 * @param req
 * @param scalarFields
 * @returns
 */
export const validateFields = (value: string, scalarFields: string[]) => {
  // valueをカンマで分割
  const splitedValue = value.split(",");

  // valueが有効な値のリストに含まれているか確認
  checkValueIsReceptibe(scalarFields, splitedValue);

  return splitedValue;
};

/**
 * クエリのsorts属性に対するテストを行い、カンマ区切りで分割した配列を返却
 * DBのカラム名と一致した値を入力しているかをチェック
 * @param value
 * @param scalarFields
 * @returns
 */
export const validateSorts = (value: string, scalarFields: string[]) => {
  // valueをカンマで分割
  const splitedValue = value.split(",");

  // valueが有効な値のリストに含まれているか確認
  const receptibleReadParams = scalarFields.flatMap((field) => [
    field,
    `-${field}`,
  ]);
  checkValueIsReceptibe(receptibleReadParams, splitedValue);

  return splitedValue;
};

/**
 * 受け取った値が受付可能な値かどうかチェックする
 * @param receptibleValues
 * @param values
 */
const checkValueIsReceptibe = (
  receptibleValues: string[],
  values: string[],
) => {
  // 受け取った値の配列を回し、受け付ける値のどれかに一致するかチェックする
  const receptibleSet = new Set(receptibleValues);
  values.forEach((value) => {
    if (!receptibleSet.has(value)) {
      // 受付不可の値ならエラーを投げる
      throw new Error(ERROR_BAD_REQUEST.message);
    }
  });
};

/**
 * Read系のリクエストクエリで、フィルター条件以外を削除し返却する
 * @param query
 * @returns
 */
export const omitExceptFilters = <
  Query extends QueryTypeBasedOnReadRequest<any, any, Record<string, any>>,
>(
  query: Query,
) => {
  // フィルター条件以外を取り除く
  const { fields, sorts, limit, offset, ...filters } = query;

  return filters;
};
