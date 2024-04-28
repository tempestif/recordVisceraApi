import * as responseMessages from "@/consts/responseMessages";
import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import { isErrorResponseMessageType } from "@/consts/responseMessages/types";
import { Result, ValidationError, query } from "express-validator";
import { validateFields, validateSorts } from "../utilRequest";

/**
 * express-validatorのエラーメッセージを受け取り、Errorを返却する
 */
export const findValidateError = (message: string) => {
  const errorConsts = Object.entries(responseMessages)
    .filter(([key]) => key.startsWith("ERROR"))
    .map((keyValue) => keyValue[1])
    .filter(isErrorResponseMessageType);

  for (const value of errorConsts) {
    if (value.message === message) {
      return () => value.error(message);
    }
  }
  return () => new Error(message);
};

/**
 * バリデーション違反時のエラーメッセージから該当のエラーインスタンスを取得、そのエラーをthrowする
 * @param errors
 */
export const throwValidationError = (errors: Result<ValidationError>) => {
  if (!errors.isEmpty()) {
    // エラーメッセージに合致するエラーを探し、throwする
    const error = findValidateError(errors.array()[0].msg);
    throw error();
  }
};

/**
 * パラメータがNumberかを確認し、キャストしたものを返却する
 * express-validatorの.custom()中に利用する想定
 * そのため、投げるエラーはErrorインスタンスにBAD_REQUESTのメッセージを渡したもの
 * @param value
 * @returns
 */
export const castToNumberOrThrow = (value: string) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(ERROR_BAD_REQUEST.message);
  }
  return num;
};

/**
 * パラメータがDateかを確認し、キャストしたものを返却する
 * express-validatorの.custom()中に利用する想定
 * そのため、投げるエラーはErrorインスタンスにBAD_REQUESTのメッセージを渡したもの
 * @param value
 * @returns
 */
export const castToDateOrThrow = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(ERROR_BAD_REQUEST.message);
  }
  return date;
};

/**
 * readのAPIのクエリで基本的に受け取る、fields, sorts, limit, offsetのバリデーションを返却する
 * express-validatorに渡す、配列を返却
 * @param scalarFields
 * @returns
 */
export const validateBasisReadQuery = (scalarFields: string[]) => {
  return [
    query("fields").custom((value: string, { req }) => {
      if (!value || !req.query) return;
      const splitedValue = validateFields(value, scalarFields);
      req.query.fields = splitedValue;
    }),

    query("sorts").custom((value: string, { req }) => {
      if (!value || !req.query) return;
      const splitedValue = validateSorts(value, scalarFields);
      req.query.sorts = splitedValue;
    }),
    query("limit").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
    query("offset").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  ];
};
