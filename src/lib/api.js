const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiRequestError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(
      body?.message || "Something went wrong",
      response.status,
      body?.errors || []
    );
  }

  return body;
}

export async function apiDownload(path, filename) {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiRequestError(body?.message || "Download failed", response.status, body?.errors || []);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
