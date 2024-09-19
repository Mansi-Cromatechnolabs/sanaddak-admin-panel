import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

export const hasPermission = (permissionName) => {
  const loginData = localStorageGet('loginData');
  if (!loginData || !loginData.permissions) return false;

  return loginData.permissions.some((permission) => permission.name === permissionName);
};
