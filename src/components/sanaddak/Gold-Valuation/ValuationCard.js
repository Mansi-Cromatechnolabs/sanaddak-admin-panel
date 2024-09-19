/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Divider, Typography, CardContent } from '@mui/material';

import { handleLoader } from 'src/utils/loader';

export default function ValuationCard({
  valuation_Id,
  liquidity_amt,
  required_amt,
  gold_weight,
  gold_karat,
  tenure,
  onApplyClick,
  isApply,
}) {

  const [customLoading, setCustomLoading] = useState(false);

  const handleApplyClick = (event) => {
    event.stopPropagation();
    setCustomLoading(true);
    if (onApplyClick) {
      setTimeout(() => {
        setCustomLoading(false);
        onApplyClick(event);
      }, 2000)
    }
    else {
      handleLoader(setCustomLoading, false);
    }
  };

  return (
    <div>
      <Card
        sx={{
          borderRadius: '10px',
        }}
      >
        <CardContent>
          {/* <Box display="flex" justifyContent="flex-end"> */}
          <Typography variant="body2" color="textSecondary" textAlign="start" gutterBottom>
            Valuation Id :{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {valuation_Id}
            </Typography>
          </Typography>

          {/* </Box> */}
          <Typography variant="body2" color="textSecondary" textAlign="start" gutterBottom>
            Liquidity Amount :{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {liquidity_amt}
            </Typography>
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="start" gutterBottom>
            Required Liquidity Amount :{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {required_amt}
            </Typography>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} mb={2}>
            <Grid item xs={4}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {gold_weight}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Weight
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {gold_karat}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Karat
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {tenure}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tenure
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {isApply && (
            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <LoadingButton loading={customLoading} type="submit" variant="contained" onClick={handleApplyClick}>
                Proceed
              </LoadingButton>
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
