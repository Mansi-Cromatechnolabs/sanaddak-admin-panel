'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// import ForgotPassword from 'src/sections/forgot-password/forgotPassword';

const ForgotPassword = dynamic(() => import('src/sections/forgot-password/forgotPassword'), {
  ssr: false,
});

function Page() {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Forgot Password">
        <ForgotPassword />
      </AuthClassicLayout>
    </GuestGuard>
  );
}

export default Page;
