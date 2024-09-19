/* eslint-disable radix */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

'use client';

import * as Yup from 'yup';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Box, Stack } from '@mui/system';
import {
  Card,
  Avatar,
  Select,
  Button,
  MenuItem,
  CardHeader,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

export default function CustomerCalculatinCard({
  loanCalculationData,
  onSave,
  onAdd,
  onAddAppointment,
}) {
  const [tenureList, setTenureList] = useState([]);
  const [valuationId, setValuationId] = useState('');
  const userSchema = Yup.object().shape({
    loanAmount: Yup.number()
      .typeError('Loan Amount must be a number')
      .required('Loan Amount is required')
      .positive('Loan Amount is required & must be positive'),
    weight: Yup.number()
      .typeError('Weight must be a number')
      .required('Weight is required')
      .positive('Weight is required & must be positive')
      .test('weight-format', 'Weight must have at most 3 decimal places', (value) => {
        if (value == null) {
          return true;
        }
        const regex = /^\d+(\.\d{0,3})?$/;
        return regex.test(value);
      }),

    caratage: Yup.number()
      .typeError('Karat must be a number')
      .required('Karat is required')
      .positive('Karat is required & must be positive')
      .max(24, 'Karat cannot be more than 24'),
    tenure: Yup.string().required('Tenure is required'),
  });
  const defaultValues = {
    loanAmount: '',
    weight: '',
    caratage: '',
    tenure: '',
  };
  const methods = useForm({
    resolver: yupResolver(userSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { loanAmount, weight, caratage, tenure } = data;
      const apiData = {
        tenure_in_months: parseInt(tenure),
        customer_cash_needs: loanAmount,
        gold_weight: weight,
        gold_purity_entered_per_1000: caratage,
        valuation_id: !valuationId ? null : valuationId,
      };

      if (loanCalculationData?.appointment_data?.appointmentId) {
        await handleAppointmentData(apiData);
      } else {
        await handleValuationData(apiData);
      }
    } catch (error) {
      console.error(error);
    }
  });
  const handleValuationData = async (apiData) => {
    try {
      const response = await ApiCalling.apiCallPost(
        `gold_loan/loan_calculator?customer_id=${loanCalculationData?.customer_id}`,
        apiData
      );
      if (response.data) {
        onSave(valuationId);
        setValuationId('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAppointmentData = async (apiData) => {
    if (!valuationId) {
      try {
        const response = await ApiCalling.apiCallPost(
          `gold_loan/loan_calculator?customer_id=${loanCalculationData?.appointment_data?.customerId}&appointment_id=${loanCalculationData?.appointment_data?.appointmentId}`,
          apiData
        );
        if (response.data) {
          onAddAppointment(response.data.data);
          setValuationId('');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await ApiCalling.apiCallPost(
          `gold_loan/loan_calculator?customer_id=${loanCalculationData?.appointment_data?.customerId}`,
          apiData
        );
        if (response.data) {
          onSave(response.data.data.valuation_id);
          setValuationId('');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const SubheaderWithAdditional = () => (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {loanCalculationData?.customer?.email}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {loanCalculationData?.customer?.phone}
      </Typography>
    </Box>
  );
  const TitleWithAdditional = () => (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {loanCalculationData?.customer?._id}
      </Typography>
      <Typography variant="h6">{loanCalculationData?.customer?.full_name}</Typography>
    </Box>
  );
  useEffect(() => {
    if (loanCalculationData) {
      const loanAmount = loanCalculationData?.req_loan_amt?.replace(/[^\d.-]/g, '');
      const tenureMatch = loanCalculationData?.tenure?.match(/\d+/);
      const tenureValue = tenureMatch ? parseInt(tenureMatch[0], 10) : '';
      setValuationId(loanCalculationData.liq_id);
      reset({
        loanAmount,
        weight: loanCalculationData.weight,
        caratage: loanCalculationData.caratage,
        tenure: tenureValue,
      });
    }
  }, [loanCalculationData]);
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
    getTenureList();
  }, []);
  return (
    <div>
      <Card sx={{ mb: 2 }}>
        <CardHeader
          avatar={
            <Avatar
              src="https://mui.com/static/images/avatar/3.jpg"
              aria-label="recipe"
              sx={{ width: 56, height: 56 }}
            />
          }
          title={<TitleWithAdditional />}
          subheader={<SubheaderWithAdditional />}
          titleTypographyProps={{
            sx: {
              fontSize: '1rem',
            },
          }}
          subheaderTypographyProps={{
            sx: {
              marginTop: 0,
            },
          }}
          sx={{
            marginBottom: 2,
          }}
        />
      </Card>
      <Box textAlign="right">
        <Button
          sx={{ mb: 2 }}
          variant="contained"
          onClick={() => {
            onAdd();
            setValuationId('');
            reset({
              loanAmount: '',
              weight: '',
              caratage: '',
              tenure: '',
            });
          }}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Add New Valuation
        </Button>
      </Box>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" mb={2} color={(theme) => theme.palette.text.primary}>
            Loan Calculation
          </Typography>
          <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
            <RHFTextField name="loanAmount" label="Required Loan Amount" type="text" />

            <RHFTextField name="weight" label="Weight(in gram)" type="number" />

            <RHFTextField name="caratage" label="Karat" type="number" />
            <Controller
              name="tenure"
              render={({ field, fieldState }) => (
                <FormControl fullWidth>
                  <InputLabel>Tenure (in months)</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    label="Tenure (in months)"
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

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained">
              Calculate
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </div>
  );
}
