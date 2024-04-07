export interface ResponseMessageType {
  readonly message: string;
}

export interface ErrorResponseMessageType extends ResponseMessageType {
  readonly error: (message: string) => Error;
}

// ErrorResponseMessageTypeの型ガード関数
export const isErrorResponseMessageType = (
  errorConsts: ResponseMessageType | ErrorResponseMessageType
): errorConsts is ErrorResponseMessageType => {
  return "error" in errorConsts;
};
