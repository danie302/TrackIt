export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  companyId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
