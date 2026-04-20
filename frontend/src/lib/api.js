const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`, { headers: headers() }).then((r) => r.json()),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then((r) => r.json()),
  put: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then((r) => r.json()),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() }).then((r) => r.json()),
};
