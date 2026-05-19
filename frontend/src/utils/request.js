import { API_BASE_URL } from "@/config";

let csrfToken = null;

export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(url, { ...options, headers });
  const responseCsrfToken = response.headers.get("X-CSRF-Token");
  if (responseCsrfToken) csrfToken = responseCsrfToken;

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = null;
  }
  if (data?.csrfToken) csrfToken = data.csrfToken;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

export function get(path, options = {}) {
  return request(path, { ...options, method: "GET", credentials: "include" });
}

function jsonRequest(path, method, body, options = {}) {
  return request(path, {
    ...options,
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function post(path, body, options = {}) {
  return jsonRequest(path, "POST", body, options);
}

export function put(path, body, options = {}) {
  return jsonRequest(path, "PUT", body, options);
}

export function del(path, options = {}) {
  return request(path, {
    ...options,
    method: "DELETE",
    credentials: "include",
  });
}

export function postForm(path, body, options = {}) {
  return request(path, {
    ...options,
    method: "POST",
    credentials: "include",
    body,
  });
}
