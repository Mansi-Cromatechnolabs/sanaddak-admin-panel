/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */

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

import LiquidityDursementCard from './LiquidityDursementCard';

export default function LiquidityDisbursementView() {
  const settings = useSettingsContext();
  const [liquidityDisbursementList, setLiquidityDisbursementList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getLiquidityDisbursementList = () => {
    ApiCalling.apiCallGet('loan')
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setLiquidityDisbursementList(res.data.data);
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
    getLiquidityDisbursementList();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Transaction Processing System"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container spacing={2}>
          {loading ? (
            <Loader />
          ) : hasData ? (
            <>
              {liquidityDisbursementList?.map((l, i) => {
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <LiquidityDursementCard
                      data={l}
                      customerId={l.customer_id}
                      onApprove={() => {
                        getLiquidityDisbursementList();
                      }}
                    />
                  </Grid>
                );
              })}
            </>
          ) : (
            <NoResultFound />
          )}
        </Grid>
      </Container>
    </div>
  );
}
