/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Paper, Typography, CardContent } from '@mui/material';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const AppointmentTabs = ({ filteredValues, getConfigData }) => {
  const firstFieldRef = useFocusOnMount();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const configSchema = Yup.object().shape({
    value: Yup.string().required('Appointment is required'),
  });

  const defaultValues = {
    value: filteredValues[0] || '',
  };

  const methods = useForm({
    resolver: yupResolver(configSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    watch,
    handleSubmit,
  } = methods;

  const watchFields = watch(['value']);

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        type: 'appointment',
        key: 'appointment_show_days',
        value: data.value,
      };
      const response = await ApiCalling.apiCallPatch('global_config', apiData);
      if (response && response.data) {
        setTimeout(() => {
          getConfigData();
          setCustomLoading(false);
          ToasteMessage(response.data.message, 'success');
        }, 1000);
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  };

  useEffect(() => {
    const { value } = getValues();
    setIsFormValid(!!value);
  }, [watchFields, getValues]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Card>
      <CardContent>
        <Paper sx={{ m: 1, p: 1, mt: 0 }}>
          <Stack onKeyDown={handleKeyDown}>
            <FormProvider methods={methods}>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h3" mb={2}>
                  Advance Appointment Booking
                </Typography>
                <RHFTextField
                  fullWidth={false}
                  label="Value"
                  name="value"
                  type="text"
                  inputRef={firstFieldRef}
                />
              </Stack>
              {hasPermission('globalConfig.update') && (
                <div className="text-end">
                  <LoadingButton
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="soft"
                    loading={customLoading}
                    disabled={!isFormValid}
                    onClick={handleSubmit(onSubmit)}
                  >
                    Update
                  </LoadingButton>
                </div>
              )}
            </FormProvider>
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default AppointmentTabs;
