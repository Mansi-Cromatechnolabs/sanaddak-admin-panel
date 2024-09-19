'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import GlobalConfigView from 'src/sections/global-config/GlobalConfigView';

const GlobalConfigView = dynamic(() => import('src/sections/global-config/GlobalConfigView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <GlobalConfigView />
    </div>
  );
}
export default withPermission(page, 'globalConfig.view');
