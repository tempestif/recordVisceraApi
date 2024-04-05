export interface ResponseMessageType {
  readonly message: string;
}

export interface ErrorResponseMessageType extends ResponseMessageType {
  readonly error: (message: string) => Error;
}
