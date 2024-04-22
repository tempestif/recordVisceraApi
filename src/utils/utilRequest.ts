import { Request } from "express";

export type QueryTypeBasedOnReadRequest<T extends string, U extends string> = {
  fields: T[] | undefined;
  sorts: U[] | undefined;
  limit: number | undefined;
  offset: number | undefined;
};
export type AnyRequest = Request<any, any, any, any>;
