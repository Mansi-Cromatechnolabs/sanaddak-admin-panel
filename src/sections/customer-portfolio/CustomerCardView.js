'use client';

import React from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import LoanCard from './CustomerCard';

export default function CustomerCardView() {
  const settings = useSettingsContext();
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer Portfolio"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <LoanCard />
      </Container>
    </div>
  );
}
