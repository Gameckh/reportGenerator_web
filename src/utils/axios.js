// src/utils/axios.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:8888', // 根据实际后端地址修改
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  config => config,
  error => {
    ElMessage.error('请求错误');
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    ElMessage.error('响应错误');
    return Promise.reject(error);
  }
);

export default instance;
