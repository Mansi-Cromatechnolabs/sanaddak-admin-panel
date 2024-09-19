/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/exhaustive-deps */
import AWS from 'aws-sdk';
/* eslint-disable react/no-unstable-nested-components */
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect, useCallback } from 'react';
/* eslint-disable react/prop-types */

import 'react-international-phone/style.css';
import { PhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import {
  Card,
  Drawer,
  Select,
  Button,
  MenuItem,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { fData } from 'src/utils/format-number';
import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import {
  RHFCheckbox,
  RHFTextField,
  RHFMultiSelect,
  RHFUploadAvatar,
} from 'src/components/hook-form';

export const removeCountryCode = (fullPhoneNumber, code) => {
  if (!code.startsWith('+')) {
    code = `+${code}`;
  }
  if (fullPhoneNumber.startsWith(code)) {
    return fullPhoneNumber.slice(code.length);
  }
  return fullPhoneNumber;
};
export default function UserAddEditForm({ open, onClose, onSave, editValue }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY;
  const secretAccessKey = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY;
  const region = process.env.NEXT_PUBLIC_REGION;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [storeList, setStoreList] = useState([]);
  const [roleList, setRoleList] = useState([]);

  const [phoneError, setPhoneError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const firstFieldRef = useRef();
  const [customLoading, setCustomLoading] = useState(false);

  const userSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    store: Yup.string(),
    role: Yup.mixed().nullable().required('Role is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: null,
    store: '',
    role: null,
    isFrenciseAdmin: false,
  };
  const methods = useForm({
    resolver: yupResolver(userSchema),
    defaultValues,
  });

  const { reset, handleSubmit, setValue, watch, getValues, setError } = methods;

  const watchFields = watch(['firstName', 'lastName', 'email', 'role', 'store', 'isFrenciseAdmin']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      let err = false;
      if (!data.isFrenciseAdmin && !data.store) {
        setError('store', {
          type: 'manual',
          message: 'Store is required',
        });
        err = true;
      }
      if (!phoneNumber) {
        setPhoneError('Phone number is required');
        err = true;
      } else if (!isValidPhone) {
        setPhoneError('Please enter valid phone');
        err = true;
      }

      if (err) {
        handleLoader(setCustomLoading, false);
        return;
      }

      if (!err) {
        let profileImageName;
        if (data?.avatarUrl && data?.avatarUrl instanceof File) {
          const extension = data?.avatarUrl?.path.split('.').pop();
          profileImageName = `profile_image.${extension}`;
        }
        const apiData = {
          ...(editValue !== null && { staff_id: editValue?._id }),
          first_name: data.firstName,
          last_name: data.lastName,
          country_code: countryCode,
          email: data.email,
          mobile_number: removeCountryCode(phoneNumber, countryCode),
          role_id: data.role,
          store_id: data.store,
          is_admin: data.isFrenciseAdmin,
          ...(profileImageName && { profile_image: profileImageName }),
        };
        const res = await ApiCalling.apiCallPost(`staff`, apiData);

        if (res.data) {
          const staffId = res.data.data?.id;
          if (data?.avatarUrl && data?.avatarUrl instanceof File) {
            await uploadToS3(staffId);
          }
          setPhoneNumber('');
          setCountryCode('');

          reset({
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            store: '',
            avatarUrl: null,
          });

          onClose();
          ToasteMessage(res?.data?.message, 'success');
          onSave();

          handleLoader(setCustomLoading, false, 500);
        } else {
          handleLoader(setCustomLoading, false);
        }
      }
    } catch (er) {
      console.error(er);
      handleLoader(setCustomLoading, false, 500);
      reset();
    }
  });

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
  const getStoreList = () => {
    ApiCalling.apiCallGet('branch/branch_list')
      .then((res) => {
        if (res.data) {
          const formattedData = res.data.data.map((item) => ({
            label: item.name,
            value: item._id,
          }));
          setStoreList(formattedData);
        } else {
          console.log('error', res);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const getRoleList = () => {
    ApiCalling.apiCallGet('tanant/role/list')
      .then((res) => {
        if (res.data) {
          if (localStorageGet('loginData')?.is_admin) {
            const formattedData = res.data.data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
            setRoleList(formattedData);
          } else {
            const formattedData = res.data.data
              .filter((item) => item.name !== 'super-admin')
              .map((item) => ({
                label: item.name,
                value: item.id,
              }));
            setRoleList(formattedData);
          }
        } else {
          console.log('error', res);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    if (editValue?._id) {
      setPhoneNumber(editValue?.mobile_number);
      setCountryCode(editValue?.country_code);
      reset({
        firstName: editValue?.first_name,
        lastName: editValue?.last_name,
        email: editValue?.email,
        role: editValue?.role_id,
        store: editValue?.store_id,
        avatarUrl: `${s3URL}/${editValue?._id}/${editValue?.profile_image}`,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        store: '',
        avatarUrl: null,
      });
      setPhoneNumber('');
      setCountryCode('');
    }
  }, [editValue?._id]);

  useEffect(() => {
    getStoreList();
    getRoleList();
  }, []);

  useEffect(() => {
    if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [firstFieldRef.current]);

  useEffect(() => {
    const { firstName, lastName, email, store, role, isFrenciseAdmin } = getValues();
    if (isFrenciseAdmin) {
      setIsFormValid(!!firstName && !!lastName && !!email && !!role);
    } else {
      setIsFormValid(!!firstName && !!lastName && !!email && !!store && !!role);
    }
  }, [watchFields, getValues]);

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
      <RHFTextField
        id="outlined-email"
        label="First Name"
        type="text"
        name="firstName"
        inputRef={firstFieldRef}
      />
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
          {phoneError}
        </FormHelperText>
      )}
      <RHFMultiSelect name="role" label="Role" options={roleList} chip multiple />

      <Controller
        name="store"
        render={({ field, fieldState }) => (
          <FormControl fullWidth>
            <InputLabel>Store</InputLabel>
            <Select
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250,
                  },
                },
              }}
              {...field}
              value={field.value || ''}
              onChange={(event) => field.onChange(event.target.value)}
              label="Store"
              error={!!fieldState.error}
            >
              {storeList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )}
      />
      {localStorageGet('loginData')?.is_admin && (
        <RHFCheckbox name="isFrenciseAdmin" label="is Franchise Admin" />
      )}
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        variant="contained"
        sx={{ marginTop: 2 }}
        type="submit"
        loading={customLoading}
        disabled={!isFormValid}
      >
        Save
      </LoadingButton>
    </Stack>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        onClose();
        setCustomLoading(false);
        if (editValue === null) {
          reset({
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            store: '',
            avatarUrl: null,
          });
          setPhoneNumber('');
          setCountryCode('');
        }
      }}
    >
      <Box
        sx={{
          width: 500,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        role="presentation"
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
          }}
        >
          <Typography
            variant="h2"
            mb={2}
            className="d-flex align-items-center justify-space-between"
          >
            {editValue ? 'Edit User' : 'Add User'}
            <Button
              onClick={onClose}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            {renderForm}
          </FormProvider>
        </Box>
      </Box>
    </Drawer>
  );
}
