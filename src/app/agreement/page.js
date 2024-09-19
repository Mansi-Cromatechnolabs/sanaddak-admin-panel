/* eslint-disable react-hooks/rules-of-hooks */

'use client';

import React from 'react';
// import AgreementView from 'src/sections/agreement/agreementView';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

const AgreementView = dynamic(() => import('src/sections/agreement/agreementView'), { ssr: false });

function page() {
  return (
    <div>
      <AgreementView />
    </div>
  );
}
export default withPermission(page, 'liquidityApplicationProcess.liquidityApplicationProcess');
