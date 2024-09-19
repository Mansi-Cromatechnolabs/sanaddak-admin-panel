'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import AllLiquidityList from 'src/sections/liquidity-portfolio/AllLiquidityList';

const AllLiquidityList = dynamic(
  () => import('src/sections/liquidity-portfolio/AllLiquidityList'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <AllLiquidityList />
    </div>
  );
}
export default withPermission(page, 'liquidityPortfolio.view');
