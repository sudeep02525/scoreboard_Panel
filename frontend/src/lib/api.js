const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (r) => {
  if (!r.ok) {
    try {
      const err = await r.json();
      return { error: true, message: err.message || 'API Error' };
    } catch (e) {
      return { error: true, message: `Server error: ${r.statusText}` };
    }
  }
  try {
    return await r.json();
  } catch (e) {
    return { error: true, message: 'Invalid JSON response from server' };
  }
};

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`, { headers: headers() })
    .then(handleResponse).catch((err) => ({ error: true, message: 'Network Error' })),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    .then(handleResponse).catch((err) => ({ error: true, message: 'Network Error' })),
  postFormData: (path, formData) => {
    const h = { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) };
    return fetch(`${BASE_URL}${path}`, { method: 'POST', headers: h, body: formData })
      .then(handleResponse).catch((err) => ({ error: true, message: 'Network Error' }));
  },
  put: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) })
    .then(handleResponse).catch((err) => ({ error: true, message: 'Network Error' })),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() })
    .then(handleResponse).catch((err) => ({ error: true, message: 'Network Error' })),
};
