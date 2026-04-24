import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://acuterestaurant.onrender.com/acute",
  /// baseURL: "http://localhost:3000/acute",
  withCredentials: false, // Không cần credentials cho JWT
});

// Thêm token vào header
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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