/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

'use client';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Grid } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import SignedAgreement from './signedAgreement';
import UnsignedAgreement from './unsignedAgreement';

export default function AgreementView({ type }) {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [agreements, setAgreements] = useState([]);

  const settings = useSettingsContext();
  const getData = useSelector((state) => state.agreementData);
  const data = getData?.agreement?.agreements;
  const valuationId = getData?.agreement?.valuationId;
  const loanId = getData?.agreement?.loan_id;
  const liquidityNumber = getData?.agreement?.liquidity_number;
  const customerId = getData?.agreement?.customerId;

  useEffect(() => {
    if (data && data.length > 0) {
      setAgreements(data);
      setHasData(true);
    } else {
      setHasData(false);
    }
    setLoading(false);
  }, [data]);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Agreement"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Agreement' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          // eslint-disable-next-line react/jsx-no-undef
          <Loader />
        ) : hasData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={8}>
              <UnsignedAgreement data={agreements} valuationId={valuationId} loanId={loanId} />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <SignedAgreement
                valuationId={valuationId}
                data={agreements}
                loanId={loanId}
                liquidityNumber={liquidityNumber}
                customerId={customerId}
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
