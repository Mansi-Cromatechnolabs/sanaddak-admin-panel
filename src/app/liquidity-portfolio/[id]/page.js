'use client';

/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';

import withPermission from 'src/utils/withPermissionsUtils';

const PortfoliDetailsView = dynamic(
  () => import('src/sections/liquidity-portfolio/portfolio-details/portfolioDetailsView'),
  {
    ssr: false,
  }
);
function Page() {
  const { id } = useParams();
  const getAppointmentType = useSelector((state) => state?.appointment?.appointment);

  return <PortfoliDetailsView id={id} getAppointmentType={getAppointmentType} />;
}
export default withPermission(Page, 'liquidityPortfolio.view');
