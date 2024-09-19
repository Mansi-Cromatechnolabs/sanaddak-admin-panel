/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

'use client';

import React, { useState, useEffect } from 'react';

import { Box, Container } from '@mui/system';
import { Card, Grid, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

export default function CutomerDetails({ id }) {
  const settings = useSettingsContext();

  const [valuationList, setValuationList] = useState([]);

  const getValuationListByCustomer = () => {
    const apiData = {
      customer_id: id,
    };
    ApiCalling.apiCallPost('gold_loan/valuation_list', apiData)
      .then((res) => {
        if (res.data) {
          setValuationList(res.data.data.valuation_list);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (id) {
      getValuationListByCustomer();
    }
  }, [id]);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'List', href: paths.customer },
            { name: 'Valuation List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container spacing={2}>
          {valuationList.map((d) => {
            return (
              <Grid item xs={12} sm={12} md={3}>
                <Card sx={{ p: 3 }}>
                  <Box rowGap={1} columnGap={2} display="grid">
                    <Typography variant="h4" color={(theme) => theme.palette.text.gray500}>
                      Loan Eligibility
                    </Typography>
                    <Typography variant="h2">{d.available_liquidity_to_customer}</Typography>
                    <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
                      Required Loan Amount :{' '}
                      <Typography variant="span" fontWeight={500}>
                        {' '}
                        {d.customer_cash_needs}
                      </Typography>
                    </Typography>
                    <hr className="m-0" />
                    <Grid container spacing={3} sx={{ marginLeft: 0, marginTop: 0 }}>
                      <Grid xs={4} md={4}>
                        <Typography variant="h4">{d.gold_weight}</Typography>
                        <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
                          Weight(in gram)
                        </Typography>
                      </Grid>
                      <Grid xs={4} md={4}>
                        <Typography variant="h4">{d.gold_purity_entered_per_1000}</Typography>
                        <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
                          Karat
                        </Typography>
                      </Grid>
                      <Grid xs={4} md={4}>
                        <Typography variant="h4">{d.tenure} </Typography>
                        <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
                          Tenure
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </div>
  );
}
