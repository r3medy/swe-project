export const DEFAULT_PAGE_SIZE = 20;

export function normalizePage(page) {
  const parsedPage = Number.parseInt(page, 10);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export function normalizeLimit(limit) {
  const parsedLimit = Number.parseInt(limit, 10);
  return Number.isFinite(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : DEFAULT_PAGE_SIZE;
}

export function buildPaginatedPath(path, { page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const urlParams = new URLSearchParams({
    page: String(normalizePage(page)),
    limit: String(normalizeLimit(limit)),
  });
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${urlParams.toString()}`;
}

export function hasNextPage(items, limit = DEFAULT_PAGE_SIZE) {
  return Array.isArray(items) && items.length >= normalizeLimit(limit);
}
