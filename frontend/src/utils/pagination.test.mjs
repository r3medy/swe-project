import assert from "node:assert/strict";

import {
  buildPaginatedPath,
  hasNextPage,
  normalizePage,
} from "./pagination.js";

assert.equal(
  buildPaginatedPath("/wall?sortBy=Newest", { page: 2, limit: 20 }),
  "/wall?sortBy=Newest&page=2&limit=20",
);

assert.equal(
  buildPaginatedPath("/tags", { page: "0", limit: "bad" }),
  "/tags?page=1&limit=20",
);

assert.equal(normalizePage(-4), 1);
assert.equal(normalizePage("3"), 3);
assert.equal(hasNextPage([1, 2, 3], 3), true);
assert.equal(hasNextPage([1, 2], 3), false);
