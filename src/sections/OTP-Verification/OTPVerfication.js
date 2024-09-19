/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import {
  localStorageGet,
  localStorageSet,
  localStorageRemove,
} from 'src/localStorageUtils/localStorageUtils';

import FormProvider from 'src/components/hook-form';
import RHFOTPInput from 'src/components/hook-form/rhf-otpInput';

export default function OTPVerification() {
  const router = useRouter();
  const [isPhoneOrEmail, setIsPhoneOrEmail] = useState('');
  const [getLoginData, setLoginData] = useState(null);
  const [isForgotPasswordOTPVerify, setIsForgotPasswordOTPVerify] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const OTPSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required').length(6, 'OTP must be exactly 6 digits'),
  });

  const defaultValues = {
    otp: '',
  };

  const methods = useForm({
    resolver: yupResolver(OTPSchema),
    defaultValues,
  });
  const {
    reset,
    watch,
    getValues,
    handleSubmit,
  } = methods;

  const watchFields = watch(['otp']);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setCustomLoading(true);
      if (isForgotPasswordOTPVerify) {
        const apiData = {
          type: isPhoneOrEmail === 'email' ? 'email' : 'phone',
          value: getLoginData?.value,
          otp: data.otp,
          token: getLoginData?.token,
        };
        ApiCalling.apiCallPost('staff/verify_otp', apiData).then((res) => {
          if (res?.data) {
            localStorageSet('otpProps', isPhoneOrEmail);
            localStorageSet('emailOrPhoneValue', getLoginData?.value);
            setTimeout(() => {
              router.push(paths.resetPassword);
              setCustomLoading(false);
            }, 1000);
            localStorageRemove('isForgotPassword');
            setIsForgotPasswordOTPVerify(false);
          } else {
            handleLoader(setCustomLoading, false, 500);
          }
        });
      } else {
        const apiData = {
          type: isPhoneOrEmail === 'email' ? 'email' : 'phone',
          value: isPhoneOrEmail === 'email' ? getLoginData?.email : getLoginData?.mobile_number,
          otp: data.otp,
          token: getLoginData?.otp_token,
        };
        ApiCalling.apiCallPost('staff/verify_otp', apiData).then((res) => {
          if (res?.data) {
            setTimeout(() => {
              router.push(paths.dashboard.root);
              setCustomLoading(false);
            }, 1000);
          } else {
            handleLoader(setCustomLoading, false, 500);
          }
        });
      }
    } catch (error) {
      console.error(error);
      reset();
    }
  });
  const resendOTP = () => {
    reset();
    const apiData = {
      type: isPhoneOrEmail === 'email' ? 'email' : 'phone',
      ...(isForgotPasswordOTPVerify
        ? { value: getLoginData?.value }
        : {
            value: isPhoneOrEmail === 'email' ? getLoginData?.email : getLoginData?.mobile_number,
          }),
      is_active: true,
    };
    ApiCalling.apiCallPost('staff/send_otp', apiData)
      .then((res) => {
        if (res.data) {
          setTimeout(() => setCountdown(20 - 1), 1000);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
      <span>
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </span>
    );
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const PhoneOrEmail = localStorageGet('otpProps');

    setIsPhoneOrEmail(PhoneOrEmail);
    const LoginData = localStorageGet('loginData');

    setLoginData(LoginData);
    const ForgotPasswordVerify = localStorageGet('isForgotPassword');

    if (ForgotPasswordVerify) {
      setIsForgotPasswordOTPVerify(true);
    }
  }, []);

  useEffect(() => {
    const { otp } = getValues();

    setIsFormValid(!!otp);
  }, [watchFields, getValues]);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h1">
        {isPhoneOrEmail === 'email' ? 'Email' : 'Mobile Number'} OTP Verification
      </Typography>
    </Stack>
  );
  const renderForm = (
    <Stack spacing={2.5}>
      <RHFOTPInput name="otp" />
      <Typography
        component="div"
        sx={{
          textAlign: 'right',
          typography: 'caption',
          color: 'text.secondary',
        }}
      >
        <Link color="text.primary">{formatTime(countdown)}</Link>
      </Typography>
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={customLoading}
        disabled={countdown === 0 || !isFormValid}
      >
        Verify
      </LoadingButton>
    </Stack>
  );
  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 2,
        textAlign: 'center',
        typography: 'caption',
        cursor: 'pointer',
      }}
      onClick={resendOTP}
    >
      Resend OTP ?
    </Typography>
  );
  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
      {countdown === 0 && renderTerms}
    </>
  );
}
