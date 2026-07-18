const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || 'API request failed');
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
};

export const loginUser = (email, password) =>
  request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const signupUser = (fullname, email, phone, password) =>
  request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ fullname, email, phone, password }),
  });

export const fetchRegistrations = (userEmail, status) => {
  const params = new URLSearchParams();
  if (userEmail) params.append('userEmail', userEmail);
  if (status) params.append('status', status);
  return request(`/api/registrations?${params.toString()}`);
};

export const createRegistration = (registration) =>
  request('/api/registrations', {
    method: 'POST',
    body: JSON.stringify(registration),
  });

export const updateRegistration = (id, updates) =>
  request(`/api/registrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

export const deleteRegistration = (id) =>
  request(`/api/registrations/${id}`, {
    method: 'DELETE',
  });

export const recoverPassword = (email) =>
  request('/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const changePassword = (email, newPassword, token) =>
  request('/api/change-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword, token }),
  });

export const health = () => request('/api/health');
