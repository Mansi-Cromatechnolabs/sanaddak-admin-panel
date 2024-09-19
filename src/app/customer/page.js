'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import CustomerView from 'src/sections/customer/CustomerView';

const CustomerView = dynamic(() => import('src/sections/customer/CustomerView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <CustomerView />
    </div>
  );
}
export default withPermission(page, 'customer.view');
