'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import withPermission from 'src/utils/withPermissionsUtils';

// import AppointmentView from 'src/sections/Appointment/AppointmentView';

const AppointmentView = dynamic(() => import('src/sections/Appointment/AppointmentView'), {
  ssr: false,
});

function page() {
  return (
    <div>
      <AppointmentView />
    </div>
  );
}
export default withPermission(page, 'appointment.view');
