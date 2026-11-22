import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pave_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // After any change to transactions, bills or settings, tell the app to refresh reminders
    const method = (res.config.method || "get").toLowerCase();
    if (method !== "get" && /^\/(transactions|bills|settings)/.test(res.config.url || "")) {
      window.dispatchEvent(new Event("pave:data-changed"));
    }
    return res;
  },
  (err) => {
    const isAuthCall = err.config?.url?.startsWith("/auth/");
    const isSettingsRead = err.config?.method === "get" && err.config?.url === "/settings";
    if (err.response?.status === 401 && !isAuthCall && !isSettingsRead) {
      localStorage.removeItem("pave_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;