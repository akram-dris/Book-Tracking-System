export interface Result<T> {
    isSuccess: boolean;
    data?: T;
    errors: string[];
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
    search?: string;
}
