/* eslint-disable react/prop-types */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { Box } from '@mui/system';
import { Card, Grid, Divider, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';

import { setData } from 'src/redux/dataSlice';
import { ApplicationStatus } from 'src/ENUMS/enums';

import { handleapplicationStatus } from 'src/sections/loan-calculator/LoanCalculatorView';

export default function ValuationCard({ valuation }) {
  const router = useRouter();
  const dispatch = useDispatch();
  return (
    <>
      {valuation && (
        <Card
          sx={{
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          onClick={() => {
            handleapplicationStatus(valuation.valuation_id, ApplicationStatus.STORE_VISIT);
            router.push(paths.loanCalculator);
            dispatch(setData(valuation));
          }}
        >
          <CardContent>
            {valuation.available_liquidity_to_customer && (
              <Typography variant="body2" color="textSecondary" textAlign="start" gutterBottom>
                Liquidity Amount :{' '}
                <Typography component="span" variant="body2" fontWeight="bold">
                  {valuation.available_liquidity_to_customer}
                </Typography>
              </Typography>
            )}
            {valuation.customer_cash_needs && (
              <Typography variant="body2" color="textSecondary" textAlign="start" gutterBottom>
                Required Loan Amount :{' '}
                <Typography component="span" variant="body2" fontWeight="bold">
                  {valuation.customer_cash_needs}
                </Typography>
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {valuation.gold_weight && (
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {valuation.gold_weight}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Weight
                    </Typography>
                  </Box>
                </Grid>
              )}

              {valuation.gold_purity_entered_per_1000 && (
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {valuation.gold_purity_entered_per_1000}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Karat
                    </Typography>
                  </Box>
                </Grid>
              )}

              {valuation.tenure && (
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {valuation.tenure}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tenure
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
}
