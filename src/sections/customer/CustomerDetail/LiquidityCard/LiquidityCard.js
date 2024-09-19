/* eslint-disable react/prop-types */
import React from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

import { Card, Grid, Divider, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';

export default function LiquidityCard({ liquidity }) {
  const nextEmiPaymentDate = liquidity.next_emi_payment_date;
  return (
    <Link
      className="text-decoration-none"
      href={paths.liquidityPorfolioDetails(liquidity.liquidity_id)}
    >
      <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: 'start', cursor: 'pointer' }}>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Liquidity Amount
              </Typography>
              <Typography variant="h3" fontWeight="500">
                {liquidity.gold_rate_at_valuation}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} textAlign="end">
              <Typography variant="body2" color="textSecondary">
                Liquidity ID :{liquidity.liquidate_number}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.installment_value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Installment
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.margin_rate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Margin Rate(%)
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.total_margin}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Margin
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.gold_weight}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Weight (in gram)
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.gold_purity_entered_per_1000}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Karat
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="h6" fontWeight="bold">
                {liquidity.tenure_in_months}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tenure
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Upcoming Installment on Date:{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {nextEmiPaymentDate ? format(parseISO(nextEmiPaymentDate), 'MMMM do yyyy') : 'N/A'}
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
