/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/prop-types */
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Paper, Checkbox, Typography, CardContent, FormControlLabel } from '@mui/material';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const LockTheRateTabs = ({ filteredValues, getConfigData }) => {
  const [checked, setChecked] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    setChecked(!!filteredValues[0]);
  }, [filteredValues]);

  const defaultValues = {
    value: filteredValues[0] || '',
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
  } = methods;

  const handleChange = (event) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    setValue('value', newChecked);
  };

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        type: 'Lock the rate',
        key: 'lock_the_rate',
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
                <Typography variant="h3">Lock The Rate</Typography>
                <FormControlLabel
                  checked={checked}
                  onChange={handleChange}
                  control={<Checkbox checked={checked} />}
                  label="Lock The Rate"
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

export default LockTheRateTabs;
