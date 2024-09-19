'use client';

import React from 'react';
// import PriceTagView from 'src/sections/tag/PriceTagView/PriceTagView';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import withPermission from 'src/utils/withPermissionsUtils';

const PriceTagView = dynamic(() => import('src/sections/tag/PriceTagView/PriceTagView'), {
  ssr: false,
});

function Page() {
  const { id } = useParams(); // Fetch the dynamic segment 'id'

  return (
    <div>
      <PriceTagView id={id} />
    </div>
  );
}
export default withPermission(Page, 'priceTag.view');
