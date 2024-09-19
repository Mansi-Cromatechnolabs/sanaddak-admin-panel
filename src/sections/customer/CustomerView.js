'use client';

import React, { useState, useEffect } from 'react';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import Loader from 'src/components/loader/Loader';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import CustomerList from './CustomerList';
import CustomerAddEditForm from './Customer-add-edit';

export default function CustomerView() {
  const settings = useSettingsContext();

  const [isAddEditDrawerOpen, setIsAddEditDrawerOpen] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCustomerList = () => {
    ApiCalling.apiCallPost('customer/customer_list')
      .then((res) => {
        if (res.data) {
          setCustomerList(res.data.data);
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
    getCustomerList();
  }, []);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : (
          <CustomerList
            list={customerList}
            onDelete={() => {
              getCustomerList();
            }}
          />
        )}
        <CustomerAddEditForm
          open={isAddEditDrawerOpen}
          onClose={() => {
            setIsAddEditDrawerOpen(false);
          }}
        />
      </Container>
    </div>
  );
}
