'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import MessageView from 'src/sections/config-message/MessageView';

const MessageView = dynamic(() => import('src/sections/config-message/MessageView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <MessageView />
    </div>
  );
}
export default withPermission(page, 'messageTemplate.view');
