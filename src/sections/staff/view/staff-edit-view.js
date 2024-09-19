/* eslint-disable react/prop-types */

'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userList } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import StaffNewEditForm from '../staff-new-edit-form';

// ----------------------------------------------------------------------

export default function StaffEditView({ id }) {
  const settings = useSettingsContext();
  const currentUser = _userList.find((user) => user.id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit staff"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Staff',
            href: paths.staff.list,
          },
          { name: 'Edit staff' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StaffNewEditForm currentUser={currentUser} />
    </Container>
  );
}
