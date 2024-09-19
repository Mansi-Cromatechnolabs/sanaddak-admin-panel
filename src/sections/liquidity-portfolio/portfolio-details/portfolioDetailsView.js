/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */

'use client';

import dynamic from 'next/dynamic';
import React, { useState, Suspense, useEffect } from 'react';

import { Grid } from '@mui/material';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { LoanStatus } from 'src/ENUMS/enums';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';

const CustomBreadcrumbs = dynamic(
  () => import('src/components/custom-breadcrumbs/custom-breadcrumbs'),
  {
    ssr: false,
  }
);
const Loader = dynamic(() => import('src/components/loader/Loader'), {
  ssr: false,
});
const NoResultFound = dynamic(() => import('src/components/sanaddak/NoDataFound'), {
  ssr: false,
});

const EMIInfo = dynamic(() => import('src/sections/liquidity-portfolio/EMIInfo'), {
  ssr: false,
});
const PaymentInfo = dynamic(() => import('src/sections/liquidity-portfolio/PaymentInfo'), {
  ssr: false,
});
const LoanSummaryCard = dynamic(() => import('src/sections/liquidity-portfolio/LoanSummaryCard'), {
  ssr: false,
});

function PortfoliDetailsView({ id, getAppointmentType }) {
  const settings = useSettingsContext();

  const [liquidityPortfolioDetails, setLiquidityPortfolioDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [childLiquidity, setChildLiquidity] = useState('');

  const getLiquidityPortfolioDetails = () => {
    ApiCalling.apiCallPost(`loan/customer_portfolio?loan_id=${id}`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setLiquidityPortfolioDetails(res.data.data);
          if (
            res.data.data[0].liquidity_status === LoanStatus.ACTIVE &&
            res.data.data[0].parent_liquidity_id
          ) {
            setChildLiquidity({
              id: res.data.data[0].parent_liquidity_id,
              number: res.data.data[0].liquidate_number,
            });
          } else if (
            res.data.data[0].liquidity_status === LoanStatus.EXTEND &&
            res.data.data[0].child_liquidity_id
          ) {
            setChildLiquidity({
              id: res.data.data[0].child_liquidity_id,
              number: res.data.data[0].child_liquidity_number,
            });
          }
          setHasData(true);
        } else {
          setHasData(false);
        }
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      getLiquidityPortfolioDetails();
    }
  }, [id]);

  return (
    <Suspense fallback={<Loader />}>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liquidity Details"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'List',
              href: paths.liquidityPortfolio,
            },
            { name: 'Details' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container spacing={2}>
          {loading ? (
            <Loader />
          ) : hasData ? (
            <>
              <Grid item xs={12} sm={12} md={8}>
                <EMIInfo
                  data={liquidityPortfolioDetails[0]?.installments}
                  childLiquidity={childLiquidity}
                  isUpdated={(msg) => {
                    if (msg) {
                      getLiquidityPortfolioDetails();
                    }
                  }}
                  store_id={liquidityPortfolioDetails[0]?.store_id}
                />
                <PaymentInfo data={liquidityPortfolioDetails[0]?.transactions} />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <LoanSummaryCard
                  data={liquidityPortfolioDetails[0]}
                  appointmentType={getAppointmentType}
                />
              </Grid>
            </>
          ) : (
            <NoResultFound />
          )}
        </Grid>
      </Container>
    </Suspense>
  );
}
export default PortfoliDetailsView;
