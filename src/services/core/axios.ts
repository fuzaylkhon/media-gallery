import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '127.0.0.1/api/',
});
