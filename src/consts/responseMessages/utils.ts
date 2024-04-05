import { BadRequestError } from "@/utils/errorHandle/errors";
export const ERROR_BAD_REQUEST = {
  message: "不正なリクエストです",
  error: BadRequestError,
} as const;
