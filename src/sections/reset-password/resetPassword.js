/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-nested-ternary */

'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import Iconify from 'src/components/iconify';
import { handleLoader } from 'src/utils/loader';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function ResetPassword() {
  const router = useRouter();
  const user_id = localStorageGet('user_id');
  const newPasswordField = useBoolean();
  const confirmPasswordField = useBoolean();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const ForgotPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(6, 'Password must be at least 6 characters long')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('newPassword'), null], 'Password must be same as new password '),
  });

  const defaultValues = {
    newPassword: '',
    confirmPassword: '',
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

  const watchFields = watch(['newPassword', 'confirmPassword']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        new_password: data.newPassword,
        user_id,
      };
      ApiCalling.apiCallPost('staff/reset_password', apiData)
        .then((res) => {
          if (res.data) {
            setTimeout(() => {
              setCustomLoading(false);
              router.push("/");
            }, 1000);
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


  useEffect(() => {
    const { newPassword, confirmPassword } = getValues();

    setIsFormValid(!!newPassword && !!confirmPassword);
  }, [watchFields, getValues]);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h1">Reset Password</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        name="newPassword"
        label="New Password"
        type={newPasswordField.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPasswordField.onToggle} edge="end">
                <Iconify
                  icon={newPasswordField.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <RHFTextField
        name="confirmPassword"
        label="Confirm Password"
        type={confirmPasswordField.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPasswordField.onToggle} edge="end">
                <Iconify
                  icon={confirmPasswordField.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={customLoading}
        disabled={!isFormValid}>
        Reset Password
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
