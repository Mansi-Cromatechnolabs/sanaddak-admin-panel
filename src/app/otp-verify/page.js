'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// import OTPVerification from 'src/sections/OTP-Verification/OTPVerfication';

const OTPVerification = dynamic(() => import('src/sections/OTP-Verification/OTPVerfication'), {
  ssr: false,
});

function Page() {
  return (
    <GuestGuard>
      <AuthClassicLayout title="OTP Verification">
        <OTPVerification />
      </AuthClassicLayout>
    </GuestGuard>
  );
}

export default Page;
