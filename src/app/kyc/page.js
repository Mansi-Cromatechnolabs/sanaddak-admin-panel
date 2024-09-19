'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import Kyc from 'src/sections/kyc/Kyc';

const Kyc = dynamic(() => import('src/sections/kyc/Kyc'), {
  ssr: false,
});

function page() {
  return <Kyc />;
}
export default withPermission(page, 'kyc.view');
