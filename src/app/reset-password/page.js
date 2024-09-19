'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// import ResetPassword from 'src/sections/reset-password/resetPassword';

const ResetPassword = dynamic(() => import('src/sections/reset-password/resetPassword'), {
  ssr: false,
});

function Page() {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Reset Password">
        <ResetPassword />
      </AuthClassicLayout>
    </GuestGuard>
  );
}

export default Page;
