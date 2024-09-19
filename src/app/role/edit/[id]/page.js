/* eslint-disable react-hooks/rules-of-hooks */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import withPermission from 'src/utils/withPermissionsUtils';

// import EditRole from 'src/sections/role/EditRole';

const EditRole = dynamic(() => import('src/sections/role/EditRole'), {
  ssr: false,
});

function page() {
  const { id } = useParams();
  return (
    <div>
      <EditRole id={id} />
    </div>
  );
}
export default withPermission(page, 'role&Permissions.view');
