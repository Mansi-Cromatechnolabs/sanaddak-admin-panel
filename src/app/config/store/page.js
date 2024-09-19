'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import StoreConfigurationView from 'src/sections/StoreConfiguration/StoreConfigurationView';

const StoreConfigurationView = dynamic(
  () => import('src/sections/StoreConfiguration/StoreConfigurationView'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <StoreConfigurationView />
    </div>
  );
}
export default withPermission(page, 'store.storeConfiguration');
