const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // for cookie authentication
    cache: "no-store",
  });

  let data: unknown;
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { success: response.ok, message: await response.text() };
  }

  if (!response.ok) {
    const errData = (data || {}) as { code?: string; message?: string };
    throw new ApiError(
      response.status,
      errData.code || "SERVER_ERROR",
      errData.message || response.statusText || "Something went wrong"
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
};
