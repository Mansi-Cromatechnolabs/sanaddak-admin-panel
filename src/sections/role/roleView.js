'use client';

import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import RoleList from './roleList';

export default function RoleView() {
  const settings = useSettingsContext();
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getRoleList = () => {
    ApiCalling.apiCallGet('tanant/role/list')
      .then((res) => {
        if (res.data) {
          setRoleList(res.data.data);
          setHasData(true);
        }
        else {
          setHasData(false);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getRoleList();
  }, []);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Role"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('role&Permissions.create') && (
              <Button
                href={paths.addRole}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Role
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : hasData ? (
          <RoleList list={roleList} onDelete={getRoleList} />
        ) : (
          <NoResultFound />
        )}
      </Container>
    </div>
  );
}
