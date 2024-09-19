/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import navigation hooks from 'next/navigation' for Next.js 13
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils'; // Adjust the path to your actual utility

function withPermission(Component, requiredPermissions) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const user = localStorageGet('loginData'); // Retrieve user data from local storage
    const hasPermission = (permissions) => {
      if (!permissions) return false;

      if (Array.isArray(requiredPermissions)) {
        // Check if the user has all of the required permissions
        return requiredPermissions.some((perm) => permissions.some((p) => p.name === perm));
      }

      // Check if the user has the single required permission
      return permissions.some((p) => p.name === requiredPermissions);
    };
    useEffect(() => {
      if (!user?.token) {
        // If no token, redirect to login page
        router.push('/');
        return;
      }

      if (!hasPermission(user.permissions)) {
        router.push('/no-permission');
      }
    }, [user, requiredPermissions, router]);

    if (!user || !hasPermission(user.permissions)) {
      return null; // Render nothing if the user does not have the required permissions
    }

    return <Component {...props} />;
  };
}

export default withPermission;
