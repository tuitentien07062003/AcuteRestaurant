import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://acuterestaurant.onrender.com",
  withCredentials: true,
});

// Log requests
axiosClient.interceptors.request.use(config => {
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Handle 401
axiosClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.warn("[API] 401 Unauthorized", err.config.url);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;