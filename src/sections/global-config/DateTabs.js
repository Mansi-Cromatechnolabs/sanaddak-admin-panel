/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import React, { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  CardContent,
  FormControl,
  FormHelperText,
} from '@mui/material';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const LockTheRateTabs = ({ filteredValues, getConfigData }) => {
  const dateFormats = [
    { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
    { value: 'dd MM yyyy', label: 'dd MM yyyy' },
    { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy' },
    { value: 'dd/MMM/yyyy', label: 'dd/MMM/yyyy' },
    { value: 'dd MMM yyyy', label: 'dd MMM yyyy' },
    { value: 'dd-MMM-yyyy', label: 'dd-MMM-yyyy' },
    { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
    { value: 'MM dd yyyy', label: 'MM dd yyyy' },
    { value: 'MM-dd-yyyy', label: 'MM-dd-yyyy' },
    { value: 'MMM/dd/yyyy', label: 'MMM/dd/yyyy' },
    { value: 'MMM dd yyyy', label: 'MMM dd yyyy' },
    { value: 'MMM-dd-yyyy', label: 'MMM-dd-yyyy' },
    { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd' },
    { value: 'yyyy MM dd', label: 'yyyy MM dd' },
    { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
    { value: 'yyyy/MMM/dd', label: 'yyyy/MMM/dd' },
    { value: 'yyyy MMM dd', label: 'yyyy MMM dd' },
    { value: 'yyyy-MMM-dd', label: 'yyyy-MMM-dd' },
  ];

  const firstFieldRef = useFocusOnMount();
  const [customLoading, setCustomLoading] = useState(false);

  const configSchema = Yup.object().shape({
    dateFormat: Yup.string().required('Date format is required'),
  });

  const methods = useForm({
    resolver: yupResolver(configSchema),
    defaultValues: {
      dateFormat: filteredValues[0],
    },
  });

  const {
    reset,
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        type: 'date',
        key: 'global_date_time_format',
        value: data.dateFormat,
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
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  };

  return (
    <Card>
      <CardContent>
        <Paper sx={{ m: 1, p: 1, mt: 0 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h3" mb={2}>
                Date
              </Typography>
              <Controller
                name="dateFormat"
                control={methods.control}
                inputRef={firstFieldRef}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Date</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      label="Date"
                      MenuProps={{
                        autoFocus: false,
                        PaperProps: {
                          style: {
                            maxHeight: 230,
                            width: 200, 
                          },
                        },
                      }}
                    >
                      {dateFormats.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && (
                      <FormHelperText>{fieldState.error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
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
                >
                  Update
                </LoadingButton>
              </div>
            )}
          </FormProvider>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default LockTheRateTabs;
