import axios from "axios";

const cloudinaryAxios = axios.create({
  baseURL: "https://api.cloudinary.com",
  timeout: 20000,
});

export default cloudinaryAxios;
