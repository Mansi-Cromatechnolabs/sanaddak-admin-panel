'use client';

import * as Yup from 'yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { Grow, Dialog, Typography, IconButton, DialogTitle, DialogContent } from '@mui/material';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import RHFOTPInput from 'src/components/hook-form/rhf-otpInput';
import FormProvider from 'src/components/hook-form/form-provider';

export default function OtpDialog({ open, onSave, handleClose }) {
  const [isSentOTP, setIsSentOTP] = useState(false);
  const [getValue, setValue] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const getPhoneSchema = Yup.object().shape({
    value: Yup.string().required('value is required'),
  });

  const otpSendMethods = useForm({
    resolver: yupResolver(getPhoneSchema),
    defaultValues: {
      value: '',
    },
  });

  const {
    reset: resetFields,
    handleSubmit: handleOtpSendSubmit,
    setError: sendOtpError,
    getValues: getOTPValue,
  } = otpSendMethods;

  const OTPSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required').length(6, 'OTP must be exactly 6 digits'),
  });

  const methods = useForm({
    resolver: yupResolver(OTPSchema),
    defaultValues: {
      otp: '',
    },
  });

  const {
    reset,
    handleSubmit,
  } = methods;

  const onOtpSendSubmit = handleOtpSendSubmit(async () => {
    setCustomLoading(true);
    const value = getOTPValue('value');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{8,13}$/;
    const isTypeCheck = /^\d+$/.test(value) ? 'phone' : 'email';

    try {
      let error = false;

      if (isTypeCheck === 'email') {
        if (!emailRegex.test(value)) {
          sendOtpError('value', {
            type: 'manual',
            message: 'Email must be a valid email address',
          });
          error = true;
        }
      } else if (isTypeCheck === 'phone') {
        if (!phoneRegex.test(value)) {
          sendOtpError('value', {
            type: 'manual',
            message: 'Phone number is not correct',
          });
          error = true;
        }
      }

      if (!error) {
        const apiData = {
          type: isTypeCheck,
          value,
          is_active: true,
        };

        try {
          const res = await ApiCalling.apiCallPost('staff/send_otp', apiData);
          if (res.data) {
            setTimeout(() => {
              setIsSentOTP(true);
              setValue(res.data.data);
              setCustomLoading(false);
            }, 2000);
          } else {
            handleLoader(setCustomLoading, false, 500);
          }
        } catch (apiError) {
          handleLoader(setCustomLoading, false, 500);
          console.error(apiError);
        }
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSentOTP(false);
    setCustomLoading(true);
    try {
      const isTypeCheck = isNaN(getOTPValue('value')) ? 'email' : 'phone';
      const apiData = {
        type: isTypeCheck,
        value: getOTPValue('value'),
        otp: data.otp,
        token: getValue.token,
      };

      ApiCalling.apiCallPost('staff/verify_otp', apiData).then((res) => {
        if (res?.data) {
          onSave();
          setTimeout(() => {
            setCustomLoading(false);
            reset();
            handleClose();
          }, 2000);
        } else {
          handleLoader(setCustomLoading, false, 500);
        }
      });
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  });

  const verifyOTPForm = (
    <Stack spacing={2.5}>
      <RHFOTPInput name="otp" />

      <Box pb={3}>
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={customLoading}
        >
          Send code
        </LoadingButton>
        <Typography
          component="div"
          sx={{
            mt: 1,
            textAlign: 'center',
            typography: 'caption',
            color: 'text.secondary',
            cursor: 'pointer',
          }}
          onClick={() => {
            setIsSentOTP(false);
          }}
        >
          Resend OTP?
        </Typography>
      </Box>
    </Stack>
  );

  const sendOtpForm = (
    <Stack spacing={2.5} mt={2}>
      <RHFTextField label="Enter Email/Phone" name="value" />

      <Box pb={3}>
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={customLoading}
        >
          Send code
        </LoadingButton>
      </Box>
    </Stack>
  );

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          handleClose();
          resetFields({ value: '' });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
        TransitionProps={{
          onEntered: () => {
            resetFields({ value: '' });
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontSize={16} fontWeight={600}>{isSentOTP ? 'Verify OTP' : 'Send OTP'}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isSentOTP ? (
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {verifyOTPForm}
            </FormProvider>
          ) : (
            <FormProvider methods={otpSendMethods} onSubmit={onOtpSendSubmit}>
              {sendOtpForm}
            </FormProvider>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
