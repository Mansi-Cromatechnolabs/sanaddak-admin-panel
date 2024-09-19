/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Chip from '@mui/material/Chip';
import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {
  Grow,
  Grid,
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableFooter,
  DialogTitle,
  DialogContent,
  TableContainer,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';
import { appendDecimal } from 'src/utils/appendDecimalUtils';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import { EmiStatus } from 'src/ENUMS/enums';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

export default function EMIInfo({ data, childLiquidity, isUpdated, store_id }) {
  const router = useRouter();
  const [summaryDetails, setSummaryDetails] = useState(null);
  const [summaryModel, setSummaryModel] = useState(false);
  const [waiveModel, setWaiveModel] = useState(false);
  const WaiveSchema = Yup.object().shape({
    waiveAmount: Yup.number().required('Waive Amount is required'),
  });

  const methods = useForm({
    resolver: yupResolver(WaiveSchema),
    defaultValues: {
      type: 'amount',
      penaltyAmount: '',
      waiveAmount: '',
      netAmount: '',
    },
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
    getValues,
  } = methods;

  const onSubmit = handleSubmit(async (d) => {
    try {
      const apiData = {
        loan_emi_id: summaryDetails?.emi_id,
        waiver_type: getValues('type'),
        waiver_value: getValues('waiveAmount').toString(),
        is_waive: 1,
      };
      ApiCalling.apiCallPatch('loan/waiver_calculate', apiData)
        .then((res) => {
          if (res.data) {
            setWaiveModel(false);
            isUpdated('apiCall');
            reset();
          } else {
            setError('waiveAmount', {
              type: 'manual',
              message: 'Waive Amount cannot be more than Penalty Amount',
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  });
  useEffect(() => {
    if (!data) {
      router.push(paths.customerPortfolio);
    }
  }, [data]);

  const statusToLabelAndColor = (status) => {
    switch (status) {
      case EmiStatus.PAID:
        return { label: 'Paid', color: 'success' };
      case EmiStatus.PENDING:
        return { label: 'Pending', color: 'warning' };
      case EmiStatus.EXPIRED:
        return { label: 'Expired', color: 'error' };
      case EmiStatus.OVERDUE:
        return { label: 'Overdue', color: 'error' };
      default:
        return { label: 'Unknown', color: 'default' };
    }
  };

  const extractNumericValue = (amount) => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.-]/g, ''));
  };
  const penaltyAmount = extractNumericValue(summaryDetails?.penalty);

  const handleWaiverCalculate = () => {
    const apiData = {
      loan_emi_id: summaryDetails?.emi_id,
      waiver_type: getValues('type'),
      waiver_value: getValues('waiveAmount').toString(),
      is_waive: 0,
    };
    ApiCalling.apiCallPatch('loan/waiver_calculate', apiData)
      .then((res) => {
        if (res.data) {
          setValue('netAmount', res.data.data?.waive);
        } else {
          setError('waiveAmount', {
            type: 'manual',
            message: 'Waive Amount cannot be more than Penalty Amount',
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const validateWaiveAmount = () => {
    const type = getValues('type');
    const waiveAmount = getValues('waiveAmount');
    const penalty = extractNumericValue(summaryDetails?.penalty);

    if (type === 'amount' && waiveAmount > penalty) {
      setError('waiveAmount', {
        type: 'manual',
        message: 'Waive Amount cannot be more than Penalty Amount',
      });
    } else if (type === 'percentage' && waiveAmount > 100) {
      setError('waiveAmount', { type: 'manual', message: 'Waive Amount cannot be more than 100%' });
    } else {
      clearErrors('waiveAmount');
    }
  };

  return (
    <div className="mb-4">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" color={(theme) => theme.palette.text.primary} mb={1.5}>
          Installment Summary
        </Typography>
        {childLiquidity?.id && (
          <Typography
            variant="h3"
            color={(theme) => theme.palette.text.primary}
            mb={1.5}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              router.push(paths.liquidityPorfolioDetails(childLiquidity?.id));
            }}
          >
            Extended Liquidity :{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {childLiquidity?.number}
            </Typography>
          </Typography>
        )}
      </Box>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Number</TableCell>
              <TableCell> Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {data?.length > 0 ? (
            <TableBody>
              {data?.map((e, i) => {
                const { label, color } = statusToLabelAndColor(e.emi_status);
                return (
                  <TableRow key={i}>
                    <TableCell>{e.emi_number}</TableCell>
                    <TableCell>{e.emi_amount}</TableCell>
                    <TableCell>{globalUTCFormatDate(e.emi_payment_date)}</TableCell>
                    <TableCell>
                      <Chip variant="soft" label={label} color={color} />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSummaryDetails(e);
                          setSummaryModel(true);
                        }}
                      >
                        <RemoveRedEyeIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          ) : (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                  No Data Found
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <Dialog
        open={summaryModel}
        onClose={() => {
          setSummaryModel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Box className="d-flex align-items-center justify-space-between">
            <Typography variant="h2">Summary</Typography>
            <Button
              onClick={() => {
                setSummaryModel(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
            <Grid container spacing={1}>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Installment Number
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {summaryDetails?.emi_number}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Date
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {globalUTCFormatDate(summaryDetails?.emi_payment_date)}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Amount
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {summaryDetails?.emi_amount}
              </Grid>
              {penaltyAmount > 0 && (
                <>
                  <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                    Penalty on installment
                  </Grid>
                  <Grid item xs={6} textAlign="end" fontWeight={600}>
                    {summaryDetails?.penalty}
                  </Grid>
                </>
              )}

              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Status
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {summaryDetails?.emi_status}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Transaction ID
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {summaryDetails?.transaction_id}
              </Grid>

              {extractNumericValue(summaryDetails?.penalty_weive) > 0 ? (
                <>
                  <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                    Penalty Waived
                  </Grid>
                  <Grid item xs={6} textAlign="end" fontWeight={600}>
                    {summaryDetails?.penalty_weive}
                  </Grid>
                  <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                    Net Penalty
                  </Grid>
                  <Grid item xs={6} textAlign="end" fontWeight={600}>
                    {summaryDetails?.net_penalty}
                  </Grid>
                  <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                    Amount to be paid by Customer
                  </Grid>
                  <Grid item xs={6} textAlign="end" fontWeight={600}>
                    {summaryDetails?.weiver_amount}
                  </Grid>
                </>
              ) : (
                <>
                  {summaryDetails?.emi_status !== 'paid' && (
                    <>
                      <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                        Amount paid by Customer
                      </Grid>
                      <Grid item xs={6} textAlign="end" fontWeight={600}>
                        {summaryDetails?.total_due}
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Box>

          <Stack direction="row" spacing={2} sx={{ m: 3 }}>
            {localStorageGet('loginData')?.is_admin ||
            (!localStorageGet('loginData')?.is_admin &&
              localStorageGet('loginData')?.store_id === store_id) ? (
              <>
                {summaryDetails?.emi_status !== 'paid' && (
                  <>
                    {penaltyAmount > 0 && hasPermission('liquidityPortfolio.penaltyWaive') && (
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSummaryModel(false);
                          setWaiveModel(true);
                        }}
                      >
                        Penalty Waive
                      </LoadingButton>
                    )}
                  </>
                )}
              </>
            ) : (
              ''
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={waiveModel}
        onClose={() => {
          setWaiveModel(false);
          setSummaryDetails(null);
          reset({ penaltyAmount: '', netAmount: '', waiveAmount: '', type: '' });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
        TransitionProps={{
          onEntered: () => {
            if (summaryDetails !== null) {
              const amount = summaryDetails?.penalty_weive?.replace(/[^\d.-]/g, '').trim();

              reset({
                penaltyAmount: summaryDetails.penalty,
                netAmount: summaryDetails.net_penalty,
                waiveAmount: amount,
                type: summaryDetails.weiver_type || 'amount',
              });
            }
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h2" className="d-flex align-items-center justify-space-between">
            Penalty waive
            <Button
              onClick={() => {
                setWaiveModel(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2}>
              <RHFRadioGroup
                row
                name="type"
                spacing={4}
                options={[
                  { value: 'amount', label: 'On Amount' },
                  { value: 'percentage', label: 'On Percentage (%)' },
                ]}
                onChange={(e) => {
                  const { value } = e.target;
                  setValue('type', value);
                  setValue('waiveAmount', '');
                }}
              />
              <RHFTextField name="penaltyAmount" label="Penalty Amount" disabled />
              <RHFTextField
                name="waiveAmount"
                label="Waive Amount"
                type="number"
                onChange={(e) => {
                  const { value } = e.target;
                  setValue('waiveAmount', value);
                  validateWaiveAmount();
                }}
                onBlur={(e) => {
                  const updatedValue = appendDecimal(e.target.value);
                  if (getValues('type') === 'amount') {
                    setValue('waiveAmount', updatedValue);
                  }
                  if (!errors.waiveAmount) {
                    handleWaiverCalculate();
                  }
                }}
                InputProps={
                  watch('type') === 'amount'
                    ? {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography
                              variant="body2"
                              sx={{ color: (theme) => theme.palette.text.primary }}
                            >
                              EGP
                            </Typography>
                          </InputAdornment>
                        ),
                      }
                    : undefined
                }
              />
              <RHFTextField name="netAmount" label="Net Amount" disabled />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ m: 3 }}>
              <LoadingButton type="submit" variant="contained" fullWidth onClick={() => {}}>
                Save
              </LoadingButton>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
