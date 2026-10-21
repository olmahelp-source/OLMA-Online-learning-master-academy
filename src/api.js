export class ApiError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

async function request(method, url, body) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that it is running and try again.');
  }

  if (res.status === 204) return null;

  // Errors from a proxy or a crashed server may not be JSON, so fall back to the status code.
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error || `Server error (${res.status})`, data?.details);
  }
  return data;
}

export const api = {
  list: (table) => request('GET', `/api/${table}`),
  create: (table, values) => request('POST', `/api/${table}`, values),
  createMany: (table, rows) => request('POST', `/api/${table}/batch`, rows),
  update: (table, id, values) => request('PUT', `/api/${table}/${encodeURIComponent(id)}`, values),
  remove: (table, id) => request('DELETE', `/api/${table}/${encodeURIComponent(id)}`),
};
