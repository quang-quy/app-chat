import axios from "axios";

const BASE_URL = "https://localhost:7008/api/Usernew";

export const UploadAvatar = async (formData) => {
  return axios.post(`${BASE_URL}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

