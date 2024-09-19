'use client';

import React from 'react';
// import LiquidityApplicationView from 'src/sections/liquidity-application/LiquidityApplicationView';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

const LiquidityApplicationView = dynamic(
  () => import('src/sections/liquidity-application/LiquidityApplicationView'),
  { ssr: false }
);

function page() {
  return (
    <div>
      <LiquidityApplicationView />
    </div>
  );
}
export default withPermission(page, 'liquidityApplicationProcess.liquidityApplicationProcess');
