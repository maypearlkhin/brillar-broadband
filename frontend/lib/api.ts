import { axiosClient } from "./axiosClient";

const isFormData = (data: unknown): data is FormData => data instanceof FormData;

export const getData = (resource: string) => axiosClient.get(resource);

export const postData = (resource: string, data?: unknown) => {
  const config = isFormData(data) ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
  return axiosClient.post(resource, data, config);
};

export const putData = (resource: string, data?: unknown) => axiosClient.put(resource, data);

export const patchData = (resource: string, data?: unknown) => axiosClient.patch(resource, data);

export const deleteData = (resource: string) => axiosClient.delete(resource);
