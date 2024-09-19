import axios from 'axios';
import { useSelector } from 'react-redux';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const x_tenant_id = process.env.NEXT_PUBLIC_X_TENANT_ID;

const useApiCallGet = () => {
  const token = useSelector((state) => state.auth.user);

  const getApi = async (url) => {
    const header = { 'x-tenant-id': x_tenant_id };

    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axios({
        url: BASE_URL + url,
        method: 'GET',
        headers: header,
      });
      return response;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    }
  };

  return getApi;
};

export default useApiCallGet;
