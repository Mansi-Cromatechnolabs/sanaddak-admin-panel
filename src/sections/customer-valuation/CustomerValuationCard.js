/* eslint-disable consistent-return */

'use client';

import { useDispatch } from 'react-redux';
/* eslint-disable react/prop-types */
import { useRouter } from 'next/navigation';
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Card, Grid, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';

import { setLoanData } from 'src/redux/loanDataSlice';

export default function CustomerValuationCard({
  list,
  id,
  onCardClick,
  isUpdatedId,
  isCardSelected,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedCardId, setSelectedCardId] = useState('');

  const [shakingCardId, setShakingCardId] = useState(null);

  const handleCardClick = (data) => {
    setSelectedCardId(data.valuation_id);

    onCardClick(data, list.customer);
  };

  const onApplyClick = (d) => {
    dispatch(setLoanData({ loanDetails: d, customerId: list?.customer?.id }));
    router.push(paths.loanCalculator);
  };

  useEffect(() => {
    if (isUpdatedId) {
      setShakingCardId(isUpdatedId);

      const timer = setTimeout(() => {
        setShakingCardId(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isUpdatedId]);

  useEffect(() => {
    if (isCardSelected) {
      setSelectedCardId(isCardSelected);
    }
  }, [isCardSelected]);

  return (
    <div>
      <Grid container spacing={2}>
        {list?.valuation_list?.length > 0 ? (
          <>
            {list?.valuation_list?.map((d) => (
              <Grid item xs={12} sm={12} md={6}>
                <Card
                  sx={{
                    border: (theme) =>
                      ` ${
                        selectedCardId === d.valuation_id &&
                        `2px solid ${theme.palette.text.primary}`
                      } `,
                    transition: 'border 0.3s',
                    cursor: 'pointer',
                  }}
                  className={d.valuation_id === shakingCardId && 'card-tilt-shake'}
                >
                  <CardContent onClick={() => handleCardClick(d)}>
                    <Box rowGap={1} columnGap={2} display="grid">
                      <Typography variant="h4" color={(theme) => theme.palette.text.gray500}>
                        Loan Eligibility
                      </Typography>
                      <Typography variant="h2">{d.cash_to_customer}</Typography>
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
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        onClick={() => {
                          onApplyClick(d);
                        }}
                      >
                        Apply
                      </LoadingButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        ) : (
          <Card sx={{ maxWidth: 300, margin: 'auto', textAlign: 'center', padding: 2 }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <ErrorOutlineIcon color="error" sx={{ fontSize: 40, marginBottom: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  No Data Found
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>
    </div>
  );
}
