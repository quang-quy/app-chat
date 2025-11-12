import axios from "axios";

const BASE_URL = 'https://localhost:7008/api/Auth';

export const LoginAPI  = async (data) => {
    return axios.post(`${BASE_URL}/login`, data);
}
 
export const   api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 