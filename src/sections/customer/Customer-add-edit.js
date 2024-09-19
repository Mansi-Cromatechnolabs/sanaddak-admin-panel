/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import 'react-international-phone/style.css';
/* eslint-disable react/prop-types */
import React, { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { PhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Drawer, Typography, CardContent, FormHelperText } from '@mui/material';

import { fData } from 'src/utils/format-number';

import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

export default function CustomerAddEditForm({ open, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [error, setError] = useState('');

  const TenureSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    avatarUrl: Yup.mixed().nullable().required('Avatar is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: null,
  };
  const methods = useForm({
    resolver: yupResolver(TenureSchema),
    defaultValues,
  });

  const { reset, handleSubmit, setValue } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      let error = false;
      if (!phoneNumber) {
        setError('Phone number is required');
        error = true;
      }
      if (!error) {
      }
    } catch (error) {
      console.error(error);
      reset();
    }
  });

  const phoneUtil = PhoneNumberUtil.getInstance();

  const handlePhoneNumberChange = (phone) => {
    setPhoneNumber(phone);

    try {
      const parsedNumber = phoneUtil.parse(phone);
      const countrycode = parsedNumber.getCountryCode();
      const dialcode = `+${countrycode}`;

      setCountryCode(dialcode);
    } catch (error) {
    }
  };
  const isValidPhone = (phone) => {
    try {
      const parsedNumber = phoneUtil.parse(phone);
      return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
      return false;
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const renderForm = (
    <Stack spacing={2}>
      <Card
        sx={{
          backgroundColor: 'transparent',
          border: (theme) => `2px dashed ${theme.palette.text.gray500}`,
        }}
      >
        <CardContent>
          <RHFUploadAvatar
            name="avatarUrl"
            maxSize={10485760}
            onDrop={handleDrop}
            helperText={
              <Typography
                variant="caption"
                sx={{
                  mt: 3,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.disabled',
                }}
              >
                Allowed *.jpeg, *.jpg, *.png, *.gif
                <br /> max size of {fData(10485760)}
              </Typography>
            }
          />
        </CardContent>
      </Card>
      <RHFTextField id="outlined-email" label="First Name" type="text" name="firstName" />
      <RHFTextField id="outlined-email" label="Last Name" type="text" name="lastName" />
      <RHFTextField id="outlined-email" label="Email Address" type="text" name="email" />
      <PhoneInput
        defaultCountry="in"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        style={{ width: '100%', zIndex: 11 }}
      />

      {!isValidPhone && (
        <FormHelperText sx={{ mt: '-11px' }} error="true">
          {error}
        </FormHelperText>
      )}
    </Stack>
  );
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{ width: 500, padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
        role="presentation"
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h2" mb={2}>
            Add Customer{' '}
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            {renderForm}
          </FormProvider>
        </Box>
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={onSubmit}
        >
          Save
        </LoadingButton>
      </Box>
    </Drawer>
  );
}
