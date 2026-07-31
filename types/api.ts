export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  /** Internal only — do not display to users */
  statusCode: number;
  /** Backend business error code for friendly mapping */
  code?: string;
  errors?: Record<string, string[]>;
  retryAfterSec?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
