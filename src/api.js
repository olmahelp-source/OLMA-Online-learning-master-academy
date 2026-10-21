async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list: (table) => request('GET', `/api/${table}`),
  create: (table, values) => request('POST', `/api/${table}`, values),
  update: (table, id, values) => request('PUT', `/api/${table}/${encodeURIComponent(id)}`, values),
  remove: (table, id) => request('DELETE', `/api/${table}/${encodeURIComponent(id)}`),
};
