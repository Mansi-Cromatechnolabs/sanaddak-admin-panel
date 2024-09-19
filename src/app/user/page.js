'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import UserView from 'src/sections/User/UserView';

const UserView = dynamic(() => import('src/sections/User/UserView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <UserView />
    </div>
  );
}
export default withPermission(page, 'user.view');
