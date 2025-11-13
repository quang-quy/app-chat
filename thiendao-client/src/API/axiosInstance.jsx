import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:7008/api/Auth", 
});

// Gắn token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi toàn cục (ví dụ: token hết hạn)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ");
      localStorage.removeItem("token");
      window.location.href = "/login"; // hoặc dùng navigate
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
