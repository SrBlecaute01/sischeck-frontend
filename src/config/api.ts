import axios from 'axios';

const local = 'http://192.168.1.110:3056'

const api = axios.create({
  baseURL: local
});

export default api;