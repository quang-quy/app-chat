import axios from "axios";

const BASE_URL = 'https://localhost:7008/api/Auth';

export const LoginAPI  = async (data) => {
    return axios.post(`${BASE_URL}/login`, data);
}

export const GetDataUser = async () => {
  const token = localStorage.getItem("token");

  return axios.get(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};




export const LogoutAPI = async () => {
  const token = localStorage.getItem("token");

  return axios.post(`${BASE_URL}/logout`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

 

 