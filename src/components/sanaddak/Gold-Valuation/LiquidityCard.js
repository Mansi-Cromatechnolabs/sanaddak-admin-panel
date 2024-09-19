/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Chip, Typography, CardContent } from '@mui/material';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';

export default function LiquidityCard({
  liquidity_amt,
  l_id,
  installment,
  m_rate,
  tenure,
  total_margin,
  karat,
  weight,
  upcoming_installment_date,
  onCardClick,
  isApply,
  onApplyClick,
  l_status,
  valuation_Id,
  chipLabel,
  chipColor,
  isButtonHide,
  req_liquidity_amt,
  isDisabled,
  ...other
}) {
  const [customLoading, setCustomLoading] = useState(false);

  const handleApplyClick = (event) => {
    event.stopPropagation();
    setCustomLoading(true);
    if (onApplyClick) {
      setTimeout(() => {
        setCustomLoading(false);
        onApplyClick(event);
      }, 2000);
    } else {
      setCustomLoading(false);
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
      onClick={onCardClick}
      {...other}
    >
      <CardContent>
        {isApply && (
          <Grid display="flex" justifyContent="space-between" alignItems="center">
            {l_id && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Liquidity Id :{' '}
                <Typography component="span" variant="body2" fontWeight="bold">
                  {l_id}
                </Typography>
              </Typography>
            )}

            {valuation_Id && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Valuation Id :{' '}
                <Typography component="span" variant="body2" fontWeight="bold">
                  {valuation_Id}
                </Typography>
              </Typography>
            )}

            {l_status && <Chip label={chipLabel} variant="soft" color={chipColor} />}
          </Grid>
        )}
        <Grid display="flex" justifyContent="space-between">
          <Typography variant="h2" mb={3} color="textSecondary" textAlign="start" gutterBottom>
            Liquidity Amount :{' '}
            <Typography component="span" variant="h2">
              {liquidity_amt}
            </Typography>
          </Typography>

          {!isApply && l_id && <Typography variant="h4"> {l_id}</Typography>}
        </Grid>

        <Grid container spacing={3} margin={0} sx={{ '.MuiGrid-item': { p: 0 } }}>
          <Grid item xs={4} md={4}>
            <Typography variant="h3">{installment}</Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              Installment{' '}
            </Typography>
          </Grid>
          <Grid item xs={4} md={4}>
            <Typography variant="h3">{m_rate}</Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              {' '}
              Margin Rate(%)
            </Typography>
          </Grid>
          <Grid item xs={4} md={4}>
            <Typography variant="h3">{total_margin}</Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              Total Margin{' '}
            </Typography>
          </Grid>
        </Grid>
        <hr />
        <Grid container spacing={3} margin={0} mb={2} sx={{ '.MuiGrid-item': { p: 0 } }}>
          <Grid item xs={4} md={4}>
            <Typography variant="h3">{weight} </Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              Weight (in gram)
            </Typography>
          </Grid>
          <Grid item xs={4} md={4}>
            <Typography variant="h3">{karat}</Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              {' '}
              Karat
            </Typography>
          </Grid>

          <Grid item xs={4} md={4}>
            <Typography variant="h3">{tenure} </Typography>
            <Typography variant="h6" color={(theme) => theme.palette.text.gray500}>
              Tenure
            </Typography>
          </Grid>
        </Grid>
        <Box
          display="flex"
          justifyContent={upcoming_installment_date ? 'space-between' : 'flex-end'}
          alignItems="center"
        >
          {upcoming_installment_date && (
            <Typography variant="h6">
              Upcoming Installment Date:{' '}
              <Typography
                variant="span"
                fontWeight="600"
                color={(theme) => theme.palette.text.primary}
              >
                {globalUTCFormatDate(upcoming_installment_date)}
              </Typography>
            </Typography>
          )}
          {isApply && !isButtonHide && (
            <LoadingButton
              type="submit"
              loading={customLoading}
              variant="contained"
              onClick={handleApplyClick}
            >
              Proceed
            </LoadingButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
