import {
  ERROR_BAD_REQUEST,
  ERROR_BOWEL_MOVEMENT_NOT_FOUND,
} from "@/consts/responseMessages";
import { findValidateError } from "@/utils/errorHandle/validate";
import {
  BadRequestError,
  DbRecordNotFoundError,
} from "@/utils/errorHandle/errors";

describe("findValidateErrorのテスト", () => {
  test("ErrorResponseMessageTypeを渡すと専用のErrorインスタンスが返却される", () => {
    // テスト対象実行
    const error = findValidateError(ERROR_BOWEL_MOVEMENT_NOT_FOUND.message);
    const throwError = () => {
      throw error();
    };

    expect(throwError).toThrow(DbRecordNotFoundError);
    expect(throwError).toThrow(ERROR_BOWEL_MOVEMENT_NOT_FOUND.message);
  });
});
