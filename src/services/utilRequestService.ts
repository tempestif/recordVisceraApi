export type QueryType = string | undefined;
export type BasedQuery = {
    sort: QueryType;
    fields: QueryType;
    limit: QueryType;
    offset: QueryType;
};
