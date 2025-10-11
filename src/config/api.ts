import axios from 'axios';

const baseUrl = import.meta.env.SISCHECK_SERVICE_URL

const api = axios.create({
  baseURL: baseUrl
});

export default api;