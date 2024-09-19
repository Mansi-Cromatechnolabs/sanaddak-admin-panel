/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */

'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Grid } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import { LoanStatus } from 'src/ENUMS/enums';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import LiquidityCard from 'src/components/sanaddak/Gold-Valuation/LiquidityCard';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

export default function CustomerLiquidityList() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const [customerLiquidityDetails, setCustomerLiquidityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const router = useRouter();

  const getCustomerLiquidityDetails = () => {
    ApiCalling.apiCallPost(`loan/customer_portfolio?customer_id=${id}`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setCustomerLiquidityDetails(res.data.data);
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
      getCustomerLiquidityDetails();
    }
  }, [id]);

  const liquidityStatus = (status) => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return { label: 'ACTIVE', color: 'primary' };
      case LoanStatus.INACTIVE:
        return { label: 'INACTIVE', color: 'info' };
      case LoanStatus.BUYBACK:
        return { label: 'BUYBACK', color: 'success' };
      case LoanStatus.EXTEND:
        return { label: 'EXTEND', color: 'secondary' };
      case LoanStatus.LIQUIDATE:
        return { label: 'LIQUIDATE', color: 'warning' };
      case LoanStatus.OVERDUE:
        return { label: 'OVERDUE', color: 'error' };

      default:
        return { label: '', color: 'default' };
    }
  };
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liquidity List"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : hasData ? (
          <Grid container spacing={2}>
            {customerLiquidityDetails?.map((c, i) => (
              <Grid item xs={12} sm={12} md={6} lg={4} key={i}>
                <Link
                  className="text-decoration-none"
                  href={paths.liquidityPorfolioDetails(c.liquidity_id)}
                >
                  <LiquidityCard
                    isApply
                    liquidity_amt={c?.available_liquidity_to_customer}
                    l_id={c?.liquidate_number}
                    installment={c?.installments[0]?.emi_amount}
                    m_rate={c?.margin_rate}
                    tenure={c?.tenure_in_months}
                    total_margin={c?.total_margin}
                    karat={c?.gold_karatage}
                    weight={c?.gold_weight}
                    upcoming_installment_date={c?.upcoming_installment_date}
                    l_status={c?.liquidity_status}
                    chipColor={liquidityStatus(c?.liquidity_status)?.color}
                    chipLabel={liquidityStatus(c?.liquidity_status)?.label}
                    isButtonHide
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoResultFound />
        )}
      </Container>
    </div>
  );
}
