/* eslint-disable @typescript-eslint/no-explicit-any */


export interface GetAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  agentStatus?:string;
  filters?: Record<string, unknown>;
  status?:string;
}
