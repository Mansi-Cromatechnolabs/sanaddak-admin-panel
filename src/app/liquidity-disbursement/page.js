'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import LiquidityDisbursementView from 'src/sections/liquidity-disbursement/LiquidityDisbursementView';

const LiquidityDisbursementView = dynamic(
  () => import('src/sections/liquidity-disbursement/LiquidityDisbursementView'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <LiquidityDisbursementView />
    </div>
  );
}
export default withPermission(page, [
  'transactionProcessingSystem.Below25kApprove',
  'transactionProcessingSystem.Above25kApprove',
]);
