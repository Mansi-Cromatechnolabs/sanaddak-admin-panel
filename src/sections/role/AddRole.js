'use client';

import React from 'react';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import RoleNewEditForm from './role-new-edit-form';

export default function AddRole() {
  const settings = useSettingsContext();
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Role"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'List', href: paths.role },
            { name: 'Add' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <RoleNewEditForm />
      </Container>
    </div>
  );
}
