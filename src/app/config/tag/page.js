'use client';

import React from 'react';
// import TagView from 'src/sections/tag/tagView';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

const TagView = dynamic(() => import('src/sections/tag/tagView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <TagView />
    </div>
  );
}
export default withPermission(page, 'priceTag.view');
