import { ERROR_MULTIPLE_ACTIVE_USERS } from "@/consts/responseMessages";
import { ERROR_BAD_REQUEST } from "@/consts/responseMessages/messages/utils";
import { findActivedUsers } from "@/services/users/users";
import { customizedPrisma } from "@/utils/prismaClients";
import { body, param } from "express-validator";

/** パスワード再設定リクエストのバリデーション */
export const validatePrepare = [
  body("email")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isEmail()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom(async (value, { req }) => {
      const users = await findActivedUsers({ email: value }, customizedPrisma);
      if (users.length !== 1) {
        throw new Error(ERROR_MULTIPLE_ACTIVE_USERS.message);
      }

      req.userId = users[0].id;
    }),
];

/** パスワード再設定リクエストのバリデーション */
export const validateExecute = [
  param("id")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom(async (value, { req }) => {
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }

      req.id = num;
    }),

  param("token").notEmpty().withMessage(ERROR_BAD_REQUEST.message),

  body("newPassword").notEmpty().withMessage(ERROR_BAD_REQUEST.message),
];
