import { type Pagination as PaginationDto } from 'marble-api';

export const defaultPaginationSize = 25;

export type Pagination = {
  hasNextPage: boolean;
  startIndex: number;
  endIndex: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  hasNextPage: boolean;
  startIndex: number;
  endIndex: number;
};

export function adaptPagination(paginationDto: PaginationDto): Pagination {
  return {
    hasNextPage: paginationDto.has_next_page,
    startIndex: paginationDto.start_index,
    endIndex: paginationDto.end_index,
  };
}

export type PaginationParams = {
  next?: true | false;
  previous?: true | false;
  offsetId?: string;
  order?: 'ASC' | 'DESC';
  sorting?: 'created_at';
  limit?: number;
};

export type FiltersWithPagination<T> = T & PaginationParams;
