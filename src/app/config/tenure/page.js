'use client';

import React from 'react';
// import TenureView from 'src/sections/tenure/tenureView';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

const TenureView = dynamic(() => import('src/sections/tenure/tenureView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <TenureView />
    </div>
  );
}
export default withPermission(page, 'globalConfig.view');
