'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import EmailTemplateView from 'src/sections/config-email/EmailTemplateView';

const EmailTemplateView = dynamic(() => import('src/sections/config-email/EmailTemplateView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <EmailTemplateView />
    </div>
  );
}
export default withPermission(page, 'emailTemplate.view');
