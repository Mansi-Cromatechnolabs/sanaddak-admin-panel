/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable object-shorthand */

'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';

import { golden } from 'src/theme/palette';
import { login } from 'src/redux/authSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageSet } from 'src/localStorageUtils/localStorageUtils';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function JwtLoginView() {
  const dispatch = useDispatch();

  const router = useRouter();

  const firstFieldRef = useFocusOnMount();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const passwordField = useBoolean();

  const LoginSchema = Yup.object().shape({
    emailOrPhone: Yup.string()
      .required('Email or phone number is required')
      .test('is-valid', 'Email or phone number must be valid', (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[0-9]{8,13}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),

    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    emailOrPhone: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    handleSubmit,
  } = methods;

  const watchFields = watch(['emailOrPhone', 'password']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    const { emailOrPhone, password } = data;
    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^\d+$/.test(emailOrPhone);

    let apiData;
    if (isEmail) {
      apiData = {
        type: 'email',
        value: emailOrPhone,
        password: password,
      };
    } else if (isPhone) {
      apiData = {
        type: 'phone',
        value: emailOrPhone,
        password: password,
      };
    } else {
      throw new Error('Invalid email or phone number format');
    }

    try {
      const res = await ApiCalling.apiCallPost('staff/login', apiData);
      if (res?.data) {
        localStorageSet('loginData', res?.data?.data);
        localStorageSet('otpProps', isEmail ? 'email' : isPhone ? 'phone' : null);
        dispatch(login({ user: res.data.data }));

        setTimeout(() => {
          router.push(paths.otpVerify);
          setCustomLoading(false);
        }, 1000);
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (error) {
      console.error(error);
      reset();
      handleLoader(setCustomLoading, false, 500);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h1">
        Sign in to{' '}
        <Typography variant="body" sx={{ color: golden.default }}>
          Sanaddak
        </Typography>{' '}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        name="emailOrPhone"
        label="Email address/Mobile number"
        inputRef={firstFieldRef}
      />
      <RHFTextField
        name="password"
        label="Password"
        type={passwordField.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={passwordField.onToggle} edge="end">
                <Iconify icon={passwordField.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Link
        variant="body2"
        color="inherit"
        underline="always"
        href="/forgot-password"
        sx={{ alignSelf: 'flex-end', fontWeight: 500 }}
      >
        Forgot password?
      </Link>
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={customLoading}
        disabled={!isFormValid}
      >
        Sign in
      </LoadingButton>
    </Stack>
  );

  useEffect(() => {
    const { emailOrPhone, password } = getValues();

    setIsFormValid(!!emailOrPhone && !!password);
  }, [watchFields, getValues]);

  useEffect(() => {
    reset();
  }, []);

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
