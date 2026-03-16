export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");

  const isFormData = options.body instanceof FormData;

  return fetch(`/api/proxy/${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}), // 👈
    },
  });
}
