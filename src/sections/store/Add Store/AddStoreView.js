'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const AddStoreForm = dynamic(() => import('./AddStoreForm'), { ssr: false });

function AddStoreView() {
  const settings = useSettingsContext();
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Store"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Store', href: paths.store },
            { name: 'Add' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <AddStoreForm />
      </Container>
    </div>
  );
}
export default AddStoreView;
