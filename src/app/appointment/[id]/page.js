'use client';

/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import withPermission from 'src/utils/withPermissionsUtils';

// import AppointmentValuationView from 'src/sections/Appointment/Appointment-Detail/AppointmentValuationView';

const AppointmentValuationView = dynamic(
  () => import('src/sections/Appointment/Appointment-Detail/AppointmentValuationView'),
  {
    ssr: false,
  }
);

function page() {
  const { id } = useParams();
  return (
    <div>
      <AppointmentValuationView id={id} />
    </div>
  );
}
export default withPermission(page, 'appointment.view');
