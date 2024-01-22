import { type Pagination as PaginationDto } from 'marble-api';

export type Pagination = {
  totalCount: { value: number; isMaxCount: boolean };
  startIndex: number;
  endIndex: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: { value: number; isMaxCount: boolean };
  startIndex: number;
  endIndex: number;
};

export function adaptPagination(paginationDto: PaginationDto): Pagination {
  return {
    totalCount: {
      value: paginationDto.total_count.value,
      isMaxCount: paginationDto.total_count.is_max_count,
    },
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
