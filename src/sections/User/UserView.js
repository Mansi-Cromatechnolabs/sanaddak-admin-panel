'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify';
import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import UserList from './UserList';
import UserAddEditForm from './User-add-edit';

export default function UserView() {
  const settings = useSettingsContext();

  const [isAddEditDrawerOpen, setIsAddEditDrawerOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editValue, setEditValue] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAddUser = () => {
    setEditValue(null);
    setIsAddEditDrawerOpen(true);
  };
  const handleEditUser = (val) => {
    setEditValue(val);
    setIsAddEditDrawerOpen(true);
  };

  const handleDeleteUser = (id) => {
    const apiData = {
      id,
    };

    ApiCalling.apiCallDelete('staff/delete', apiData)
      .then((res) => {
        if (res.data) {
          getStaffList();
          ToasteMessage(res.data.message, 'success');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getStaffList = () => {
    ApiCalling.apiCallGet('staff_list')
      .then((res) => {
        if (res.data) {
          setStaffList(res.data.data);
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
    getStaffList();
  }, []);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="User"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('user.create') && (
              <Button
                onClick={handleAddUser}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add New User
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : (
          <UserList
            list={staffList}
            onEdit={(val) => {
              handleEditUser(val);
            }}
            onDelete={(id) => {
              if (id) {
                handleDeleteUser(id);
              }
            }}
          />
        )}
        <UserAddEditForm
          open={isAddEditDrawerOpen}
          onClose={() => {
            setIsAddEditDrawerOpen(false);
          }}
          onSave={getStaffList}
          editValue={editValue}
        />
      </Container>
    </div>
  );
}
