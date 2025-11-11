import axios from "axios";

const BASE_URL = 'https://localhost:7008/api/user';

export const CreateAccountAPI  = async (data) => {
    return axios.post(`${BASE_URL}/user/CreateAccount`, data);
}