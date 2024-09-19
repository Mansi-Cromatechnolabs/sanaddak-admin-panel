'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import LoanCalculatorView from 'src/sections/loan-calculator/LoanCalculatorView';

const LoanCalculatorView = dynamic(
  () => import('src/sections/loan-calculator/LoanCalculatorView'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <LoanCalculatorView />
    </div>
  );
}
export default withPermission(page, 'liquidityApplicationProcess.calculator');
