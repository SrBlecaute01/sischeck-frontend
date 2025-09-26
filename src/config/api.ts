import axios from 'axios';

const local = 'http://localhost:3056'

const api = axios.create({
  baseURL: local
});

export default api;