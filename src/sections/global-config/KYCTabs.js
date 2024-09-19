/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react';
/* eslint-disable react/prop-types */
import { useForm } from 'react-hook-form';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Paper, Typography, CardContent } from '@mui/material';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFRadioGroup } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const KYCTabs = ({ filteredValues, getConfigData }) => {
  const [customLoading, setCustomLoading] = useState(false);

  const defaultValues = {
    value: filteredValues[0]?.value || '',
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
  } = methods;

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        type: 'KYC',
        key: 'kyc_process',
        value: data.value,
      };
      const response = await ApiCalling.apiCallPatch('global_config', apiData);
      if (response && response.data) {
        setTimeout(() => {
          getConfigData();
          setCustomLoading(false);
          ToasteMessage(response.data.message, 'success');
        }, 2000);
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (error) {
      console.error(error);
      handleLoader(setCustomLoading, false, 500);
      reset();
    }
  };
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
                <Typography variant="h3">KYC Process</Typography>
                <RHFRadioGroup
                  row
                  name="value"
                  spacing={2}
                  options={[
                    { value: 1, label: 'KYC Manual' },
                    { value: 2, label: 'KYC with digified' },
                  ]}
                  onChange={(e) => {
                    const { value } = e.target;
                    setValue('value', value);
                  }}
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

export default KYCTabs;
