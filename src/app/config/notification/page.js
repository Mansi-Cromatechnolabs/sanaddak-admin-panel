'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import NotificationView from 'src/sections/config-notification/NotificationView';

const NotificationView = dynamic(
  () => import('src/sections/config-notification/NotificationView'),
  {
    ssr: false,
  }
);

function page() {
  return (
    <div>
      <NotificationView />
    </div>
  );
}
export default withPermission(page, 'notificationTemplate.view');
