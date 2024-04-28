import {
  BOWEL_MOVEMENT_BLOOD,
  BOWEL_MOVEMENT_BRISTOL_STOOL_SCALE,
  BOWEL_MOVEMENT_DRAINAGE,
} from "@/consts/dbMappings";
import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import {
  castToDateOrThrow,
  validateBasisReadQuery,
} from "@/utils/errorHandle/validate";
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
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BRISTOL_STOOL_SCALE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("blood")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BLOOD);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("drainage")
    .notEmpty()
    .withMessage(ERROR_BAD_REQUEST.message)
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_DRAINAGE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
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
  ...validateBasisReadQuery(scalarFields),
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
  query("blood")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BLOOD);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  query("drainage")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_DRAINAGE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  query("note").custom((value, { req }) => {
    if (!req.query) {
      req.query = {};
    }
    req.query.note = value ?? undefined;
  }),
  query("bristolStoolScale")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BRISTOL_STOOL_SCALE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
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
  body("blood")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BLOOD);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("drainage")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_DRAINAGE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("bristolStoolScale")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(BOWEL_MOVEMENT_BRISTOL_STOOL_SCALE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
];

export const del = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];

export const count = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];
