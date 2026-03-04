import axios from "axios";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      history.push("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
