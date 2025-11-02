import { message } from "antd";
import axios, { type AxiosRequestConfig } from "axios";
axios.interceptors.response.use((res) => {
  if (res.status !== 200) {
    message.error(res.data.message);
  }
  return res;
});
export const request = <T>(options: AxiosRequestConfig): Promise<T> => {
  return new Promise((resolve, reject) => {
    axios(options)
      .then((res) => {
        if (res.status === 200) {
          resolve(res.data);
        }
      })
      .catch((err) => {
        message.error(err.response.data.message);
        reject(err);
      });
  });
};
