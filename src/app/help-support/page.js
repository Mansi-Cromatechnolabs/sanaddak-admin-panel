'use client';

import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import HelpSupport from 'src/sections/help-support/HelpSupport';

const HelpSupport = dynamic(() => import('src/sections/help-support/HelpSupport'), {
  ssr: false,
});

function Page() {
  return <HelpSupport />;
}
export default withPermission(Page, 'help&Support.view');
