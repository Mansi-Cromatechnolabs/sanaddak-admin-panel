'use client';

import React from 'react';
// import Payment from 'src/sections/payment/Payment';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

const Payment = dynamic(() => import('src/sections/payment/Payment'), {
  ssr: false,
});

function page() {
  return <Payment />;
}
export default withPermission(page, 'payment.view');
