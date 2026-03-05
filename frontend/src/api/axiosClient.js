import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:3000/acute" : "https://acuterestaurant.onrender.com/acute",
  withCredentials: true,
});

// Log requests
axiosClient.interceptors.request.use(config => {
  console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Handle 401
axiosClient.interceptors.response.use(
  res => {
    console.log(`[API RESPONSE] ${res.status} ${res.config.url}`);
    return res;
  },
  err => {
    console.log(`[API ERROR] ${err.response?.status} ${err.config.url}`, err.response?.data);
    // Comment out to avoid reload loop
    // if (err.response?.status === 401) {
    //   console.warn("[API] 401 Unauthorized", err.config.url);
    //   window.location.href = "/login";
    // }
    return Promise.reject(err);
  }
);

export default axiosClient;