/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

'use client';

import React, { useState, useEffect } from 'react';

import { Grid } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import CustomerTabCard from './CustomerTabCard';
import CustomerProfileCard from './CustomerProfileCard';

export default function CustomerDetailsView({ id }) {
  const settings = useSettingsContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getCustomerData = () => {
    ApiCalling.apiCallGet(`loan/customer_details?customer_id=${id}`)
      .then((res) => {
        if (res.data) {
          setData(res.data.data);
          setHasData(true);
        } else {
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
    getCustomerData();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'List', href: paths.customer },
            { name: 'Details' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : hasData ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={3.5}>
              <CustomerProfileCard customerData={data?.customer} tagsData={data?.tags} id={id} />
            </Grid>
            <Grid item xs={12} sm={12} md={8.5}>
              <CustomerTabCard
                id={id}
                liquidityData={data?.liquidity_details}
                valuationsData={data?.valuations}
              />
            </Grid>
          </Grid>
        ) : (
          <NoResultFound />
        )}
      </Container>
    </div>
  );
}
