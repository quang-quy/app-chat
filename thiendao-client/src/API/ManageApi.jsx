import axios from "axios";

const BASE_URL = 'https://localhost:7008/api/User';

export const CreateAccountAPI  = async (data) => {
    return axios.post(`${BASE_URL}/CreateAccount`, data);
}