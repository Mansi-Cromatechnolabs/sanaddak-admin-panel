'use client';

/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import withPermission from 'src/utils/withPermissionsUtils';

// import CustomerDetailsView from 'src/sections/customer/CustomerDetail/CustomerDetailsView';

const CustomerDetailsView = dynamic(
  () => import('src/sections/customer/CustomerDetail/CustomerDetailsView'),
  {
    ssr: false,
  }
);

function page() {
  const { id } = useParams();
  return (
    <div>
      {/* <CustomerValuationView customerId={id} /> */}
      <CustomerDetailsView id={id} />
    </div>
  );
}
export default withPermission(page, 'customerPortfolio.view');
