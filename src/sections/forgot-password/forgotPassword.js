/* eslint-disable no-nested-ternary */

'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import { localStorageSet } from 'src/localStorageUtils/localStorageUtils';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function ForgotPassword() {
  const router = useRouter();
  const firstFieldRef = useFocusOnMount();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const ForgotPasswordSchema = Yup.object().shape({
    emailOrPhone: Yup.string()
      .required('Email or phone number is required')
      .test('is-valid', 'Email or phone number must be valid', (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[0-9]{8,13}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
  });

  const defaultValues = {
    emailOrPhone: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    handleSubmit,
  } = methods;

  const watchFields = watch(['emailOrPhone']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      const { emailOrPhone } = data;
      const isEmail = emailOrPhone.includes('@');
      const isPhone = /^[+]?\d+$/.test(emailOrPhone);
      const apiData = {
        type: isEmail ? 'email' : isPhone ? 'phone' : '',
        value: emailOrPhone,
      };
      ApiCalling.apiCallPost('staff/forgot_password', apiData)
        .then((res) => {
          if (res?.data) {
            localStorageSet('loginData', res?.data?.data);
            localStorageSet('otpProps', isEmail ? 'email' : isPhone ? 'phone' : null);
            localStorageSet('isForgotPassword', 'isForgotPassword');
            localStorageSet('user_id', res?.data?.data?.user_id);
            setTimeout(() => {
              setCustomLoading(false);
              router.push(paths.otpVerify);
            }, 2000);
          } else {
            handleLoader(setCustomLoading, false, 500);
            console.log('error', res);
          }
        })
        .catch((error) => {
          handleLoader(setCustomLoading, false, 500);
          console.error(error);
        });
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h1">Forgot Password</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField name="emailOrPhone" label="Email address/Mobile number" inputRef={firstFieldRef} />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={customLoading}
        disabled={!isFormValid}
      >
        Send code
      </LoadingButton>
    </Stack>
  );

  useEffect(() => {
    const { emailOrPhone } = getValues();

    setIsFormValid(!!emailOrPhone);
  }, [watchFields, getValues]);

  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
