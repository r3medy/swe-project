import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for fetching data from an API
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.headers - Request headers
 * @param {any} options.body - Request body
 * @param {boolean} options.autoFetch - Whether to automatically fetch on mount (default: true)
 * @param {Array} options.dependencies - Dependencies to trigger refetch
 * @returns {Object} - { data, loading, error, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    method = "GET",
    headers = {},
    body = null,
    autoFetch = true,
    dependencies = [],
  } = options;

  const fetchData = useCallback(
    async (signal) => {
      if (!url) return;

      setLoading(true);
      setError(null);

      try {
        const fetchOptions = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal,
        };

        // Only add body for methods that support it
        if (body && method !== "GET" && method !== "HEAD") {
          fetchOptions.body =
            typeof body === "string" ? body : JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        // Check if response is ok (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse response based on content type
        const contentType = response.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          result = await response.text();
        }

        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        // Don't set error if request was aborted
        if (err.name !== "AbortError") {
          setError(err.message || "An error occurred while fetching data");
          setLoading(false);
        }
        throw err;
      }
    },
    [url, method, body, headers]
  );

  // Manual refetch function
  const refetch = useCallback(() => {
    const controller = new AbortController();
    return fetchData(controller.signal);
  }, [fetchData]);

  useEffect(() => {
    if (!autoFetch) return;

    const controller = new AbortController();
    fetchData(controller.signal);

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, [autoFetch, fetchData, ...dependencies]);

  return { data, loading, error, refetch };
};

export default useFetch;
