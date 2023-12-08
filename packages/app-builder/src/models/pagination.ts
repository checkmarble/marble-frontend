export type PaginationParams = {
  next?: true | false;
  previous?: true | false;
  offsetId?: string;
  order?: 'ASC' | 'DESC';
  sorting?: 'created_at';
  limit?: number;
};

export type FiltersWithPagination<T> = T & PaginationParams;
