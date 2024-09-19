'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, IconButton, Typography, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify/iconify';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const PasswordSchema = Yup.object().shape({
  old_password: Yup.string()
    .required('Old Password is required')
    .matches(/[A-Z]/, 'Invalid old password'),
  new_password: Yup.string()
    .required('New Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Combination of characters and numbers')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confim_password: Yup.string()
    .oneOf([Yup.ref('new_password'), null], 'Confirm Password must match New Password')
    .required('Confirm Password is required'),
});

const ChangePassword = () => {
  const firstFieldRef = useFocusOnMount();
  const oldPasswordField = useBoolean();
  const newPasswordField = useBoolean();
  const confirmPasswordField = useBoolean();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const methods = useForm({
    resolver: yupResolver(PasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confim_password: '',
    },
  });

  const { handleSubmit, reset, watch, getValues } = methods;

  const watchFields = watch(['old_password', 'new_password', 'confim_password']);

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      changeProfileData(data);
      setTimeout(() => {
        setCustomLoading(false);
        reset();
      }, 2000);
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error('Error:', error);
      reset();
    }
  };

  const changeProfileData = (data) => {
    ApiCalling.apiCallPost('staff/change_password', data)
      .then((res) => {
        if (res.data) {
          ToasteMessage(res.data.message, 'success');
        }
      })
      .catch((error) => {
        console.error('API Error:', error);
      });
  };

  useEffect(() => {
    const { old_password, new_password, confim_password } = getValues();

    setIsFormValid(!!old_password && !!new_password && !!confim_password);
  }, [watchFields, getValues]);

  const renderHead = (
    <Stack spacing={2} sx={{ position: 'relative' }}>
      <Typography variant="h2" sx={{ marginBottom: 4 }}>
        Change Password
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
        <RHFTextField
          name="old_password"
          label="Old Password"
          type={oldPasswordField.value ? 'text' : 'password'}
          inputRef={firstFieldRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={oldPasswordField.onToggle} edge="end">
                  <Iconify
                    icon={oldPasswordField.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="new_password"
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
          name="confim_password"
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
      </Box>
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={customLoading}
          disabled={!isFormValid}
        >
          Save
        </LoadingButton>
      </Stack>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {renderForm}
      </FormProvider>
    </>
  );
};

export default ChangePassword;
