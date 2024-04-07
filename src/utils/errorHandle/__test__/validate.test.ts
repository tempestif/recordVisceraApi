import {
  ERROR_BAD_REQUEST,
  ERROR_BOWEL_MOVEMENT_NOT_FOUND,
} from "@/consts/responseMessages";
import { DbRecordNotFoundError } from "@/utils/errorHandle/errors";
import * as validateUtils from "@/utils/errorHandle/validate";
import {
  castToNumberOrThrow,
  throwValidationError,
} from "@/utils/errorHandle/validate";
import { Result, ValidationError } from "express-validator";

describe("findValidateErrorのテスト", () => {
  test("ErrorResponseMessageTypeを渡すと専用のErrorインスタンスが返却される", () => {
    // テスト対象実行
    const error = validateUtils.findValidateError(
      ERROR_BOWEL_MOVEMENT_NOT_FOUND.message
    );
    const throwError = () => {
      throw error();
    };

    expect(throwError).toThrow(DbRecordNotFoundError);
    expect(throwError).toThrow(ERROR_BOWEL_MOVEMENT_NOT_FOUND.message);
  });
});

describe("throwValidationErrorのエラー", () => {
  let spyFindValidateError: jest.SpyInstance<() => Error, [message: string]>;

  beforeEach(() => {
    // テストの前にfindValidateErrorのモックをクリアする
    jest.clearAllMocks();
    spyFindValidateError = jest.spyOn(validateUtils, "findValidateError");
    spyFindValidateError.mockReturnValue(
      () => new DbRecordNotFoundError("message")
    );
  });

  test("errors.isEmptyがfalseのときエラーをthrowする", () => {
    const mockErrors: Partial<Result<ValidationError>> = {
      isEmpty: () => false,
      array: () => [
        {
          type: "field",
          location: "body",
          path: "mock-path",
          value: "mock-value",
          msg: "mock-msg",
        },
      ],
    };

    const test = () => {
      throwValidationError(mockErrors as Result<ValidationError>);
    };
    expect(test).toThrow(new DbRecordNotFoundError("message"));
    expect(spyFindValidateError).toHaveBeenCalledWith("mock-msg");
  });

  test("errors.isEmptyがtrueのときは何もしない", () => {
    const mockErrors: Partial<Result<ValidationError>> = {
      isEmpty: () => true,
      array: () => [],
    };

    const test = () => {
      throwValidationError(mockErrors as Result<ValidationError>);
    };
    expect(test).not.toThrow();
  });
});

describe("throwValidationErrorのテスト", () => {
  test("数字の文字列を渡すとキャストされて返ってくる", () => {
    const result = castToNumberOrThrow("10");

    expect(result).toEqual(10);
  });

  test("数字以外の文字列を渡すとエラーが投げられる", () => {
    const test = () => {
      castToNumberOrThrow("notNumber");
    };

    expect(test).toThrow(new Error(ERROR_BAD_REQUEST.message));
  });
});
