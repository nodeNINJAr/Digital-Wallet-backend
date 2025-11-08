/* eslint-disable @typescript-eslint/no-explicit-any */


export interface GetAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}
