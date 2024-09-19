'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import StaffNewEditForm from '../staff-new-edit-form';

// ----------------------------------------------------------------------

export default function StaffCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new staff"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Staff',
            href: paths.staff.list,
          },
          { name: 'New staff' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StaffNewEditForm />
    </Container>
  );
}
