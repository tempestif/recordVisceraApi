import { Request } from "express";

export type QueryType = string | undefined;
export type BasedQuery = {
  sort: QueryType;
  fields: QueryType;
  limit: QueryType;
  offset: QueryType;
};
export type AnyRequest = Request<any, any, any, any>;
