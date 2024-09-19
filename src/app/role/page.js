'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import RoleView from 'src/sections/role/roleView';

const RoleView = dynamic(() => import('src/sections/role/roleView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <RoleView />
    </div>
  );
}
export default withPermission(page, 'role&Permissions.view');
