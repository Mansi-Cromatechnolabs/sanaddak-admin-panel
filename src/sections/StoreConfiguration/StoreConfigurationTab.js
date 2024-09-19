/* eslint-disable react/prop-types */

'use client';

import React from 'react';

import { Box } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import HolidaysView from './holidays/holidaysView';
import VerticalStoreTabs from './VerticalStoreTabs';
import AppointmentTimeSlotView from './AppointmentTimeSlot/AppointmentTimeSlotView';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: '85%' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 1, pt: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function StoreConfigTab() {
  const settings = useSettingsContext();
  const [value, setValue] = React.useState(0);

  const list = [
    {
      type: 'Appointment TimeSlots',
    },
    {
      type: 'Holidays',
    },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Store Configurations"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Configurations' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <VerticalStoreTabs
          handleChange={handleChange}
          value={value}
          setValue={setValue}
          a11yProps={a11yProps}
          TabPanel={TabPanel}
          list={list}
        />

        <TabPanel sx={{ m: 0 }} value={value} index={value}>
          {value === 0 && <AppointmentTimeSlotView />}
          {value === 1 && <HolidaysView />}
        </TabPanel>
      </Box>
    </Container>
  );
}
