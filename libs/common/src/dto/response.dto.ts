export class ApiResponseDto<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;

  constructor(data: T, message = 'Success') {
    this.data = data;
    this.message = message;
  }
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
    statusCode = 200,
  ) {
    super(data, message);
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.statusCode = statusCode;
  }
}
