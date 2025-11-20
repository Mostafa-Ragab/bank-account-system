import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function logUiEvent(message: string, haveError: boolean) {
  try {
    await api.post("/logs", {
      message,
      haveError,
      type: 1,
    });
  } catch (e) {}
}

export default api;