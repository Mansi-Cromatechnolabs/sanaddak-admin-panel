'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import AgreementView from 'src/sections/config-agreement/AgreementView';

const AgreementView = dynamic(() => import('src/sections/config-agreement/AgreementView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <AgreementView />
    </div>
  );
}
export default withPermission(page, 'agreementTemplate.view');
