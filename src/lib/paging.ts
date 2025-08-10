export type PagingQuery = { page?: unknown; pageSize?: unknown; sort?: string; order?: 'asc'|'desc'|string };

export type PagingEnvelope<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function paginate<T>(allItems: T[], query: PagingQuery, sortKey?: keyof T): PagingEnvelope<T> {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSizeRaw = Number(query.pageSize) || 20;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 100);
  const items = [...allItems];
  if (sortKey) {
    const order = (query.order === 'desc' ? 'desc' : 'asc');
    items.sort((a: any, b: any) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return order === 'asc' ? -1 : 1;
      if (bv == null) return order === 'asc' ? 1 : -1;
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return { items: paged, page, pageSize, total, totalPages };
}