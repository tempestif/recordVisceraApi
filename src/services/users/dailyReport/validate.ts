import {
  DAILY_REPORT_ABDOMINAL,
  DAILY_REPORT_ANORECTALLESITIONS,
  DAILY_REPORT_ARTHRITIS,
  DAILY_REPORT_CONDITION,
  DAILY_REPORT_OCULAR_LESIONS,
  DAILY_REPORT_SKIN_LESIONS,
  DAILY_REPORT_STOMACHACHE,
} from "@/consts/dbMappings/dailyReport";
import { ERROR_BAD_REQUEST } from "@/consts/responseMessages";
import {
  castToDateOrThrow,
  validateBasisReadQuery,
} from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import { body, oneOf, param, query } from "express-validator";

export const regist = [
  // どれかひとつでもデータがあればOK
  oneOf(
    [
      body("temp").exists(),
      body("weight").exists(),
      body("stomachach").exists(),
      body("condition").exists(),
      body("arthritis").exists(),
      body("skinLesitions").exists(),
      body("ocularLesitions").exists(),
      body("fistulaAnorectalLesitions").exists(),
      body("othersAnorectalLesitions").exists(),
      body("abdominal").exists(),
    ],
    { message: ERROR_BAD_REQUEST.message },
  ),
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
  body("temp").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("weight").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("stomachach")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_STOMACHACHE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("condition")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_CONDITION);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("arthritis")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ARTHRITIS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("skinLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_SKIN_LESIONS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("ocularLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_OCULAR_LESIONS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("fistulaAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ANORECTALLESITIONS.fistula);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("othersAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ANORECTALLESITIONS.others);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("abdominal")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ABDOMINAL);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
];

const scalarFields = Object.values(Prisma.Daily_ReportScalarFieldEnum);
export const read = [
  ...validateBasisReadQuery(scalarFields),
  query("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("temp")
    .isNumeric({ no_symbols: false })
    .withMessage(ERROR_BAD_REQUEST.message)
    .toFloat(),
  query("weight")
    .isNumeric({ no_symbols: false })
    .withMessage(ERROR_BAD_REQUEST.message)
    .toFloat(),
  query("stomachach")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("condition").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("arthritis").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  query("skinLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("ocularLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("fistulaAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("othersAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .toInt(),
  query("abdominal").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
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
  // どれかひとつでもデータがあればOK
  oneOf(
    [
      body("temp").exists(),
      body("weight").exists(),
      body("stomachach").exists(),
      body("condition").exists(),
      body("arthritis").exists(),
      body("skinLesitions").exists(),
      body("ocularLesitions").exists(),
      body("fistulaAnorectalLesitions").exists(),
      body("othersAnorectalLesitions").exists(),
      body("abdominal").exists(),
    ],
    { message: ERROR_BAD_REQUEST.message },
  ),
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
  body("temp").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("weight").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
  body("stomachach")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_STOMACHACHE);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("condition")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_CONDITION);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("arthritis")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ARTHRITIS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("skinLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_SKIN_LESIONS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("ocularLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_OCULAR_LESIONS);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("fistulaAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ANORECTALLESITIONS.fistula);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("othersAnorectalLesitions")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ANORECTALLESITIONS.others);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
  body("abdominal")
    .isNumeric()
    .withMessage(ERROR_BAD_REQUEST.message)
    .custom((value) => {
      const values = Object.values(DAILY_REPORT_ABDOMINAL);
      if (!values.includes(value)) {
        throw new Error(ERROR_BAD_REQUEST.message);
      }
    })
    .toInt(),
];

export const del = [
  param("id").isNumeric().withMessage(ERROR_BAD_REQUEST.message).toInt(),
];
