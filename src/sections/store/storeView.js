'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { Button } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const StoreList = dynamic(() => import('./StoreList'), { ssr: false });

function StoreView() {
  const settings = useSettingsContext();
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Store"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('store.create') && (
              <Button
                href={paths.addStore}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add Store
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <StoreList />
      </Container>
    </div>
  );
}
export default StoreView;
