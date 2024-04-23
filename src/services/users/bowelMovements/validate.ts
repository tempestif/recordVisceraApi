import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import { castToDateOrThrow } from "@/utils/errorHandle/validate";
import { validateFields, validateSorts } from "@/utils/utilRequest";
import { Prisma } from "@prisma/client";
import { body, param, query } from "express-validator";

export const regist = [
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

const scalarFields = Object.values(Prisma.Bowel_MovementScalarFieldEnum);
export const read = [
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

export const edit = [
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

export const del = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];

export const count = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];
