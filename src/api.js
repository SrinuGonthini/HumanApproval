import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3500/api/approvals",
  timeout: 10000
});

export default API;
