/* eslint-disable @typescript-eslint/no-explicit-any */


export interface GetAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  filters?: Record<string, any>;
}

