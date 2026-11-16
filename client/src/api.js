import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pave_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the session is invalid, go back to sign in
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("pave_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;