'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import CustomerLiquidityList from 'src/sections/customer-portfolio/CustomerLiquidityList';

const CustomerLiquidityList = dynamic(
  () => import('src/sections/customer-portfolio/CustomerLiquidityList'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <CustomerLiquidityList />
    </div>
  );
}
export default withPermission(page, 'customerPortfolio.view');
