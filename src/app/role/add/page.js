'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import AddRole from 'src/sections/role/AddRole';

const AddRole = dynamic(() => import('src/sections/role/AddRole'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <AddRole />
    </div>
  );
}
export default withPermission(page, 'role&Permissions.create');
