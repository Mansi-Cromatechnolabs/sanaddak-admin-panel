'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import CustomerCardView from 'src/sections/customer-portfolio/CustomerCardView';

const CustomerCardView = dynamic(() => import('src/sections/customer-portfolio/CustomerCardView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <CustomerCardView />
    </div>
  );
}
export default withPermission(page, 'customerPortfolio.view');
