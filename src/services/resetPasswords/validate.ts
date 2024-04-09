import { ERROR_BAD_REQUEST } from "@/consts/responseMessages/messages/utils";
import { body, param } from "express-validator";

/** パスワード再設定リクエストのバリデーション */
export const validatePrepare = [
  body("email")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isEmail()
    .withMessage(ERROR_BAD_REQUEST.message),
];

/** パスワード再設定リクエストのバリデーション */
export const validateExecute = [
  param("id")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),

  param("token").notEmpty().withMessage(ERROR_BAD_REQUEST.message),

  body("newPassword").notEmpty().withMessage(ERROR_BAD_REQUEST.message),
];
