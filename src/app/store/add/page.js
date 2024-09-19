'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import AddStoreView from 'src/sections/store/Add Store/AddStoreView';

const AddStoreView = dynamic(() => import('src/sections/store/Add Store/AddStoreView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <AddStoreView />
    </div>
  );
}
export default withPermission(page, 'store.create');
