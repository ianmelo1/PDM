import AsyncStorage from '@react-native-async-storage/async-storage';

// Em emulador Android use 10.0.2.2; em device físico use o IP da máquina na rede
const BASE_URL = 'http://192.168.0.63:3000';

async function getToken() {
  return AsyncStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  register:          (data)   => request('/auth/register',      { method: 'POST', body: JSON.stringify(data) }),
  login:             (data)   => request('/auth/login',         { method: 'POST', body: JSON.stringify(data) }),

  listCategories:    ()       => request('/categories'),
  createCategory:    (data)   => request('/categories',         { method: 'POST',   body: JSON.stringify(data) }),
  updateCategory:    (id, d)  => request(`/categories/${id}`,   { method: 'PUT',    body: JSON.stringify(d) }),
  deleteCategory:    (id)     => request(`/categories/${id}`,   { method: 'DELETE' }),

  listTransactions:  (params) => request(`/transactions${params ? `?${new URLSearchParams(params)}` : ''}`),
  createTransaction: (data)   => request('/transactions',       { method: 'POST',   body: JSON.stringify(data) }),
  updateTransaction: (id, d)  => request(`/transactions/${id}`, { method: 'PUT',    body: JSON.stringify(d) }),
  deleteTransaction: (id)     => request(`/transactions/${id}`, { method: 'DELETE' }),
};
