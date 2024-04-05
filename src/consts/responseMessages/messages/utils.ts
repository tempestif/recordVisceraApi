import { BadRequestError } from "@/utils/errorHandle/errors";
import { ErrorResponseMessageType } from "@/consts/responseMessages/types";

export const ERROR_BAD_REQUEST: ErrorResponseMessageType = {
  message: "不正なリクエストです",
  error: (message: string) => new BadRequestError(message),
};
