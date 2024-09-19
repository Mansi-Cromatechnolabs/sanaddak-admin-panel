/* eslint-disable react/prop-types */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-arrow-callback */
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { isAfter, startOfDay } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Close from '@mui/icons-material/Close';
import {
  Card,
  Grow,
  Drawer,
  Select,
  Button,
  Dialog,
  MenuItem,
  Typography,
  CardContent,
  FormControl,
  DialogTitle,
  DialogContent,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { appendDecimal } from 'src/utils/appendDecimalUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { setAgreementData } from 'src/redux/agreementSlice';

import FormProvider from 'src/components/hook-form/form-provider';
import { RHFCheckbox, RHFTextField } from 'src/components/hook-form';
import LiquidityCard from 'src/components/sanaddak/Gold-Valuation/LiquidityCard';

export default function Extend({
  open,
  onClose,
  liquidity_id,
  customer_id,
  onExtendClick,
  isConfirm,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [tenureList, setTenureList] = useState([]);
  const [extendDetail, setExtendDetail] = useState([]);
  const [isConfirmModel, setIsConfirmModel] = useState(false);

  const ExtendSchema = Yup.object().shape({
    tenure: Yup.string().required('Tenure is required'),
  });

  const defaultValues = {
    tenure: '',
    topup: true,
  };

  const methods = useForm({
    resolver: yupResolver(ExtendSchema),
    defaultValues,
  });

  const { reset, watch, getValues } = methods;

  const CustomerBalanceSchema = Yup.object().shape({
    balance: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount is required & must be positive')
      .test(
        'match-required-balance',
        `Entered amount must be exactly ${extendDetail?.extended_liquidity_details?.balace_to_paid_by_customer}`,
        function (value) {
          const enteredBalance = parseFloat(value).toFixed(2);
          const requiredBalance = parseFloat(
            extendDetail?.extended_liquidity_details?.balace_to_paid_by_customer.replace(
              /[^\d.-]/g,
              ''
            )
          ).toFixed(2);
          return enteredBalance === requiredBalance;
        }
      ),
  });

  const defaultBalanceValues = {
    balance: '',
  };

  const balanceMethods = useForm({
    resolver: yupResolver(CustomerBalanceSchema),
    defaultBalanceValues,
  });

  const {
    reset: balanceReset,
    setValue: setBalanceValue,
    handleSubmit: handleBalanceSubmit,
  } = balanceMethods;

  const onSubmit = handleBalanceSubmit(async (data) => {
    try {
      applyForLoan();
    } catch (error) {
      console.error(error);
    }
  });

  const tenure = watch('tenure');
  const topup = watch('topup');

  const applyForLoan = () => {
    const apiData = {
      parent_loan_id: liquidity_id,
      tenure,
      topup_request: topup ? 1 : 0,
    };
    ApiCalling.apiCallPost('loan', apiData)
      .then((res) => {
        if (res.data) {
          setIsConfirmModel(false);
          dispatch(
            setAgreementData({
              agreements: res.data.data.agreements,
              valuationId: null,
              loan_id: res.data.data.liquidity_id,
              liquidity_number: res.data.data.liquidity_number,
              customerId: customer_id,
            })
          );
          router.push(paths.agreement);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getExtendData = () => {
    const apiData = {
      loan_id: liquidity_id,
    };
    const defaulturl = `loan/extend_details/?customer_id=${customer_id}`;
    const urlWithQuery = `loan/extend_details?customer_id=${customer_id}&tenure=${tenure}&topup_request=${
      !topup ? 0 : 1
    }`;
    const url = tenure ? urlWithQuery : defaulturl;
    ApiCalling.apiCallPost(url, apiData)
      .then((res) => {
        if (res.data) {
          setExtendDetail(res.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (liquidity_id) {
      getExtendData();
    }
  }, [liquidity_id, tenure, topup]);

  const getTenureList = () => {
    const apiData = {
      key: 'tenure',
    };
    ApiCalling.apiCallPost('global_config', apiData).then((res) => {
      if (res.data) {
        const formattedData = res.data.data.map((item) => ({
          label: item.toString(),
          value: item.toString(),
        }));
        setTenureList(formattedData);
      }
    });
  };

  useEffect(() => {
    if (extendDetail) {
      const tenureMatch = extendDetail?.extended_liquidity_details?.tenure_in_months.match(/\d+/);
      const tenureValue = tenureMatch ? parseInt(tenureMatch[0], 10) : '';

      reset({
        tenure: tenureValue,
        topup: getValues('topup'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extendDetail]);

  useEffect(() => {
    getTenureList();
  }, []);

  useEffect(() => {
    if (isConfirm) {
      applyForLoan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirm]);

  const TOPUP = extendDetail?.extended_liquidity_details?.top_up?.replace(/[^\d.-]/g, '');
  const areAllInstallmentsPaid = extendDetail?.installments?.every(
    (emi) => emi.emi_status === 'paid'
  );

  const lastEmiPaymentDate = extendDetail?.installments?.length
    ? new Date(
        Math.max(...extendDetail?.installments?.map((emi) => new Date(emi.emi_payment_date)))
      )
    : null;
  const today = new Date();
  const isLastPaymentDateAfterToday = lastEmiPaymentDate
    ? isAfter(startOfDay(today), startOfDay(lastEmiPaymentDate))
    : false;

  const shouldDisplayButton = areAllInstallmentsPaid && isLastPaymentDateAfterToday;

  return (
    <div>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          sx={{ width: 450, padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
          role="presentation"
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <Typography
              variant="h2"
              mb={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              Extend
              <Button
                onClick={onClose}
                sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
              >
                <Close />
              </Button>
            </Typography>
            <LiquidityCard
              liquidity_amt={
                extendDetail?.existing_liquidity_details?.available_liquidity_to_customer
              }
              l_id={extendDetail?.liquidate_number}
              installment={extendDetail?.installment_amount}
              m_rate={extendDetail?.existing_liquidity_details?.margin_rate}
              tenure={extendDetail?.existing_liquidity_details?.tenure_in_months}
              total_margin={extendDetail?.existing_liquidity_details?.total_margin}
              karat={extendDetail?.gold_karatage}
              weight={extendDetail?.gold_weight}
            />

            <Card
              sx={{
                marginTop: 2,
              }}
            >
              <CardContent>
                <Typography
                  className="text-14 fw-bold mb-3"
                  color={(theme) => theme.palette.text.gray500}
                  gutterBottom
                >
                  EXTEND LIQUIDITY DETAILS
                </Typography>
                <FormProvider methods={methods}>
                  <Box component="div">
                    <Typography
                      sx={{
                        color: (theme) => theme.palette.text.gray500,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      UPDATED LIQUIDITY
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      {extendDetail?.extended_liquidity_details?.customer_remaining_balance}
                    </Typography>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Remaining Balance
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.customer_remaining_balance}
                      </Typography>
                    </Box>
                    {TOPUP > 0 && (
                      <Box
                        component="div"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <RHFCheckbox name="topup" label="Top-up required?" />
                        <Typography className="text-14 fw-bold">
                          {' '}
                          {extendDetail?.extended_liquidity_details?.top_up}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Balance to paid by customer
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.balace_to_paid_by_customer}
                      </Typography>
                    </Box>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        24K Sanaddak Gold Rate
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.gold_price_24_karate}
                      </Typography>
                    </Box>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Total Margin
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.total_margin}
                      </Typography>
                    </Box>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Tenure (in months)
                      </Typography>
                      <Controller
                        name="tenure"
                        render={({ field, fieldState }) => (
                          <FormControl sx={{ width: 80 }}>
                            <Select
                              {...field}
                              value={field.value || ''}
                              onChange={(event) => {
                                field.onChange(event.target.value);
                              }}
                              error={!!fieldState.error}
                            >
                              {tenureList.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {fieldState.error && (
                              <FormHelperText error>{fieldState.error.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Box>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Installment Amount
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.installment_value}
                      </Typography>
                    </Box>

                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Verification & Storage fee
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.admin_fee_renewal}
                      </Typography>
                    </Box>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Buyback Amount
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.buyback_amount}
                      </Typography>
                    </Box>

                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Net liquidate cash after fees
                      </Typography>
                      <Typography className="text-14 fw-bold">
                        {extendDetail?.extended_liquidity_details?.liquidate_amount}
                      </Typography>
                    </Box>
                  </Box>
                </FormProvider>
              </CardContent>
            </Card>
          </Box>
          {shouldDisplayButton && (
            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              variant="contained"
              sx={{ marginTop: 2 }}
              onClick={() => {
                if (
                  extendDetail?.extended_liquidity_details?.balace_to_paid_by_customer.replace(
                    /[^\d.-]/g,
                    ''
                  ) > 0
                ) {
                  setIsConfirmModel(true);
                } else {
                  onExtendClick();
                }
              }}
            >
              Proceed
            </LoadingButton>
          )}
        </Box>
      </Drawer>
      <Dialog
        open={isConfirmModel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle>
          <Typography variant="h2">Payment Confirmation</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3">
            Confirm, If customer paid{' '}
            {extendDetail?.extended_liquidity_details?.balace_to_paid_by_customer} for renewal
          </Typography>
          <FormProvider methods={balanceMethods}>
            <RHFTextField
              label="Enter Amount"
              sx={{ mt: 2 }}
              name="balance"
              InputProps={{
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
              }}
              onBlur={(e) => {
                const updatedValue = appendDecimal(e.target.value);
                setBalanceValue('balance', updatedValue);
              }}
            />
          </FormProvider>
        </DialogContent>

        <Box
          container
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={2}
          sx={{ m: 3 }}
        >
          <LoadingButton
            type="submit"
            variant="outlined"
            fullWidth
            onClick={() => {
              setIsConfirmModel(false);
              balanceReset();
            }}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            onClick={handleBalanceSubmit(onSubmit)}
          >
            Proceed
          </LoadingButton>
        </Box>
      </Dialog>
    </div>
  );
}
