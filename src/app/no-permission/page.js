import React from 'react';
import dynamic from 'next/dynamic';

// import NoPermissionView from 'src/sections/error/NoPermissionView';

const NoPermissionView = dynamic(() => import('src/sections/error/NoPermissionView'), {
  ssr: false,
});

export default function page() {
  return (
    <div>
      <NoPermissionView />
    </div>
  );
}
