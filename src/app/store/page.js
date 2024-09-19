'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import StoreView from 'src/sections/store/storeView';

// const withPermission = dynamic(
//   () => import('src/utils/withPermissionsUtils').then((mod) => mod.default),
//   { ssr: false }
// );
const StoreView = dynamic(() => import('src/sections/store/storeView'), { ssr: false });
function page() {
  return (
    <div>
      <StoreView />
    </div>
  );
}
export default withPermission(page, 'store.view');
