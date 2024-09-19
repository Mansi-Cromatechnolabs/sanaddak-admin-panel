/* eslint-disable no-empty */

'use client';

/* eslint-disable no-useless-catch */
/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';

import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const x_tenant_id = process.env.NEXT_PUBLIC_X_TENANT_ID;

async function apiCallGet(url) {
  const header = { 'x-tenant-id': x_tenant_id };

  const token = localStorageGet('loginData')?.token;

  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  return axios({
    url: BASE_URL + url,
    method: 'GET',

    headers: header,
  })
    .then((response) => response)
    .catch((error) => {
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    });
}

async function apiCallPost(url, bodyData) {
  const header = { 'x-tenant-id': x_tenant_id };
  const token = localStorageGet('loginData')?.token;

  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return axios({
    url: BASE_URL + url,
    method: 'POST',
    data: bodyData,
    headers: header,
  })
    .then((response) => response)
    .catch((error) => {
      ToasteMessage(error?.response?.data?.message, 'error');
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    });
}
async function apiCallPatch(url, bodyData) {
  const header = { 'x-tenant-id': x_tenant_id };

  const token = localStorageGet('loginData')?.token;
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return axios({
    url: BASE_URL + url,
    method: 'PATCH',
    data: bodyData,
    headers: header,
  })
    .then((response) => response)
    .catch((error) => {
      ToasteMessage(error?.response?.data?.message, 'error');
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    });
}
async function apiCallPut(url, bodyData) {
  const header = { 'x-tenant-id': x_tenant_id };
  const token = localStorageGet('loginData')?.token;
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  return axios({
    url: BASE_URL + url,
    method: 'PUT',
    data: bodyData,
    headers: header,
  })
    .then((response) => response)
    .catch((error) => {
      ToasteMessage(error?.response?.data?.message, 'error');
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    });
}
async function apiCallDelete(url, bodyData) {
  const header = { 'x-tenant-id': x_tenant_id };
  const token = localStorageGet('loginData')?.token;

  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return axios({
    url: BASE_URL + url,
    method: 'DELETE',
    data: bodyData,
    headers: header,
  })
    .then((response) => response)
    .catch((error) => {
      ToasteMessage(error?.response?.data?.message, 'error');
      if (error.code === 'ERR_NETWORK') {
        return 'ERR_NETWORK';
      }
      return error;
    });
}
export default {
  apiCallGet,
  apiCallPost,
  apiCallPatch,
  apiCallPut,
  apiCallDelete,
};
