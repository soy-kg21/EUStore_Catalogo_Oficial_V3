export const catalogPageSize = 24;

export function paginateCatalog<T>(items: T[], requestedPage: string, throughPage?: string) {
  const pages = Math.max(1, Math.ceil(items.length / catalogPageSize));
  const page = Math.min(pages, Math.max(1, parseInt(requestedPage) || 1));
  const through = Math.min(pages, Math.max(page, parseInt(throughPage ?? '') || page));
  return {items: items.slice((page - 1) * catalogPageSize, through * catalogPageSize), total: items.length, page, pages};
}
