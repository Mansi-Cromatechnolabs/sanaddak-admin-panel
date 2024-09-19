/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/order */

'use client';

import AWS from 'aws-sdk';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import 'react-international-phone/style.css';
import { yupResolver } from '@hookform/resolvers/yup';
import { PhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';
import React, { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography, FormHelperText } from '@mui/material';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

import OtpDialog from '../drawer/OtpDialog';
import { removeCountryCode } from '../User/User-add-edit';

const ProfileSetting = ({ updated }) => {
  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY;
  const secretAccessKey = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY;
  const region = process.env.NEXT_PUBLIC_REGION;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const firstFieldRef = useFocusOnMount();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Invalid email format'),
  });

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      avatarUrl: null,
    },
  });

  const { reset, watch, setValue, getValues, handleSubmit } = methods;

  const watchFields = watch(['firstName', 'lastName', 'email', 'phoneNumber']);

  const getProfileData = () => {
    ApiCalling.apiCallGet('staff')
      .then((res) => {
        if (res.data) {
          const response = res.data.data;

          setProfileData(response);
          reset({
            firstName: response.first_name || '',
            lastName: response.last_name || '',
            email: response.email || '',
            avatarUrl: `${s3URL}/${response?._id}/${response?.profile_image}` || null,
          });
          setPhoneNumber(response.mobile_number.trim());
          setCountryCode(response.country_code);
        }
      })
      .catch((error) => {
        console.error('Error fetching profile data:', error);
      });
  };
  useEffect(() => {
    getProfileData();
  }, []);

  const updateProfileData = async (data) => {
    const isEmailChanged = data.email !== profileData.email;
    const isPhoneChanged = phoneNumber.trim() !== profileData.mobile_number.trim();

    if (isEmailChanged || isPhoneChanged) {
      setOpenDialog(true);
      return;
    }

    updateProfile();
  };

  const uploadToS3 = async (staffId) => {
    const file = getValues('avatarUrl');
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();

    try {
      if (!file) {
        throw new Error('No file provided for upload.');
      }
      const extension = file.name.split('.').pop();
      const fileName = `${staffId}/profile_image.${extension}`;
      const params = {
        Bucket: bucket,
        Key: fileName,
        Expires: 60,
        ContentType: file?.type,
        ACL: 'public-read',
      };

      const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (response.ok) {
        const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

        return fileUrl;
      }
      console.error(`Failed to upload file ${file.name}:`, response.statusText);
      throw new Error(`Failed to upload file: ${response.statusText}`);
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  const updateProfile = async () => {
    setCustomLoading(true);
    const avtar = getValues('avatarUrl');
    let profileImageName;
    if (avtar && avtar instanceof File) {
      const staffId = profileData.id;
      await uploadToS3(staffId);
      const extension = avtar.name.split('.').pop();
      profileImageName = `profile_image.${extension}`;
    }
    const apiData = {
      id: profileData.id,
      first_name: getValues('firstName'),
      last_name: getValues('lastName'),
      email: getValues('email'),
      mobile_number: removeCountryCode(phoneNumber, countryCode),
      country_code: countryCode,
      ...(profileImageName && { profile_image: profileImageName }),
    };
    const res = await ApiCalling.apiCallPatch('staff/update', apiData);

    if (res.data) {
      updated('isUpdated');
      getProfileData();
      ToasteMessage('Profile update successfully', 'success');
      reset();
      setPhoneNumber('');
      setCountryCode('');
      handleLoader(setCustomLoading, false, 500);
    } else {
      handleLoader(setCustomLoading, false, 500);
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    let error = false;

    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      error = true;
    } else if (!isValidPhone) {
      setPhoneError('Please enter valid phone');
      error = true;
    }

    if (!error) {
      updateProfileData(data);
    }
  };

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    getProfileData();
  };

  useEffect(() => {
    const { firstName, lastName, email } = getValues();
    const isPhoneNumberValid = !!phoneNumber;

    setIsFormValid(!!firstName && !!lastName && !!email && !!isPhoneNumberValid);
  }, [watchFields, phoneNumber]);

  const renderHead = (
    <Stack spacing={2} sx={{ position: 'relative' }}>
      <Typography variant="h2" sx={{ marginBottom: 4 }}>
        Profile Setting
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
        <RHFTextField name="firstName" label="First Name" inputRef={firstFieldRef} />
        <RHFTextField name="lastName" label="Last Name" />
        <RHFTextField name="email" label="Email" type="email" />

        <PhoneInput
          defaultCountry="in"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          style={{ width: '100%', zIndex: 11 }}
        />

        {!isValidPhone && (
          <FormHelperText sx={{ mt: '-11px' }} error="true">
            {phoneError}
          </FormHelperText>
        )}
      </Box>
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={customLoading}
          disabled={!isFormValid}
        >
          Update
        </LoadingButton>
      </Stack>
    </Stack>
  );
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

  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack marginBottom={6}>
          <RHFUploadAvatar
            name="avatarUrl"
            maxSize={10485760}
            height={130}
            width={130}
            margin={0}
            helperText={
              <Typography
                variant="caption"
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  color: 'text.disabled',
                }}
              />
            }
            onDrop={handleDrop}
          />
        </Stack>
        {renderForm}
      </FormProvider>
      <OtpDialog open={openDialog} handleClose={handleCloseDialog} onSave={updateProfile} />
    </>
  );
};

export default ProfileSetting;
