/* eslint-disable consistent-return */

'use client';

// import { useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';

// import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

// export const metadata = {
//   title: 'Dashboard: App',
// };

export default function OverviewAppPage() {
  // const user = useSelector((state) => state.auth.user); // Get user data from Redux
  // console.log('user details', user);
  // const router = useRouter();
  // const loginData = localStorageGet('loginData');
  // useEffect(() => {
  //   if (!loginData?.token) {
  //     // Redirect to login if token is missing
  //     console.log('No token found, redirecting to login...');
  //     router.push('/');
  //     return;
  //   }

  //   // Connect socket if token exists
  //   socketManager.connect(loginData.token);
  //   socketManager.socket.on('notification', () => {
  //     console.log('notification');
  //   });

  //   return () => {
  //     // Cleanup socket on component unmount
  //     socketManager.disconnect();
  //   };
  // }, [loginData, router]);
  return <h1>Dashboard </h1>;
}
