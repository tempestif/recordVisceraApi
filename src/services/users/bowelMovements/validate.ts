import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import { castToDateOrThrow } from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import { body, param, query } from "express-validator";
/** regist */
export const bowelMovementRegist = [
  body("userId")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt()
    .withMessage(ERROR_BAD_REQUEST.message),
  body("bristolStoolScale")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  body("blood")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  body("drainage")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  body("date")
    .isISO8601()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value, { req }) => {
      // dateをキャストする
      if (!value) {
        req.body.date = undefined;
      } else {
        req.body.date = castToDateOrThrow(value);
      }
    }),
];
/** read */
const scalarFields = Object.values(Prisma.Bowel_MovementScalarFieldEnum);
export const bowelMovementRead = [
  query("fields").custom((value: string, { req }) => {
    if (!value || !req.query) return;

    // valueをカンマで分割
    const splitedValue = new Set(value.split(","));

    // valueが有効な値のリストに含まれているか確認
    scalarFields.forEach((receptible) => {
      if (!splitedValue.has(receptible)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    });

    req.query.fields = [...splitedValue];
  }),

  query("sorts").custom((value: string, { req }) => {
    if (!value || !req.query) return;

    // valueをカンマで分割
    const splitedValue = new Set(value.split(","));

    // valueが有効な値のリストに含まれているか確認
    const receptibleReadParams = scalarFields.flatMap((field) => [
      field,
      `-${field}`,
    ]);
    receptibleReadParams.forEach((receptible) => {
      if (!splitedValue.has(receptible)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    });

    req.query.sorts = [...splitedValue];
  }),
  query("limit").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("offset").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("date")
    .isISO8601()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value, { req }) => {
      // dateをキャストする
      if (!value) {
        req.body.date = undefined;
      } else {
        req.body.date = castToDateOrThrow(value);
      }
    }),
  query("blood").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("drainage").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("note").custom((value, { req }) => {
    if (!req.query) {
      req.query = {};
    }
    req.query.note = value ?? undefined;
  }),
  query("bristolStoolScale")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("createdAt")
    .isISO8601()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value, { req }) => {
      // dateをキャストする
      if (!value) {
        req.body.date = undefined;
      } else {
        req.body.date = castToDateOrThrow(value);
      }
    }),
  query("updatedAt")
    .isISO8601()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value, { req }) => {
      // dateをキャストする
      if (!value) {
        req.body.date = undefined;
      } else {
        req.body.date = castToDateOrThrow(value);
      }
    }),
];
/** edit */
export const bowelMovementEdit = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),

  body("date")
    .isISO8601()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value, { req }) => {
      // dateをキャストする
      if (!value) {
        req.body.date = undefined;
      } else {
        req.body.date = castToDateOrThrow(value);
      }
    }),
  body("blood").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("drainage").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("bristolStoolScale")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
];
/** delete */
export const bowelMovementDelete = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];
