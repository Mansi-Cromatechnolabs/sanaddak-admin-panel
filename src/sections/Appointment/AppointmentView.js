'use client';

import React, { useState } from 'react';

import { Button } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import dynamic from 'next/dynamic';

const AppointmentList = dynamic(() => import('./AppointmentList'), { ssr: false });
const AppointmentBooking = dynamic(() => import('./AppointmentBooking'), { ssr: false });

export default function AppointmentView() {
  const settings = useSettingsContext();

  const [isAppointmentBooked, setIsAppointmentBooked] = useState(false);
  const [isNewAppointmentModel, setIsNewAppointmentModel] = useState(false);

  const handleAddNewAppointment = () => {
    setIsNewAppointmentModel(true);
  };
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Appointment"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('appointment.appointmentBooking') &&
            localStorageGet('loginData')?.is_admin === false && (
              <Button
                onClick={handleAddNewAppointment}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Appointment Booking
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <AppointmentList isBooked={isAppointmentBooked} />

        <AppointmentBooking
          open={isNewAppointmentModel}
          onClose={() => {
            setIsNewAppointmentModel(false);
          }}
          onSave={() => {
            setIsAppointmentBooked(true);
          }}
        />
      </Container>
    </div>
  );
}
