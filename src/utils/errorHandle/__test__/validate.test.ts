import { ERROR_BOWEL_MOVEMENT_NOT_FOUND } from "@/consts/responseMessages";
import { DbRecordNotFoundError } from "@/utils/errorHandle/errors";
import * as validateUtils from "@/utils/errorHandle/validate";
import { throwValidationError } from "@/utils/errorHandle/validate";
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
