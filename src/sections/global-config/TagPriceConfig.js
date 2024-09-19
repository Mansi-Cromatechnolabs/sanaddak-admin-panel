/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Card, Paper, Typography, CardContent } from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

const TagPriceConfig = ({ filteredValues, getConfigData }) => {

  const configSchema = Yup.object().shape(
    filteredValues.reduce((schema, item) => {
      if (item.type === 'Tag price config') {
        let fieldSchema = Yup.number()
          .typeError(
            `${item.key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())} must be a number`
          )
          .required(
            `${item.key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())} is required`
          )
          .test(
            'is-not-zero',
            `${item.key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())} cannot be zero`,
            (value) => value !== 0
          );

        if (item.key === 'minimum_range_percentage' || item.key === 'maximum_range_percentage') {
          fieldSchema = fieldSchema.max(
            100,
            `${item.key.replace(/_/g, ' ')} cannot be more than 100`
          );
        }

        schema[item.key] = fieldSchema;
      }
      return schema;
    }, {})
  );

  const defaultValues = filteredValues.reduce((values, item) => {
    if (item.type === 'Tag price config') {
      values[item.key] = item.value;
    }
    return values;
  }, {});

  const methods = useForm({
    resolver: yupResolver(configSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    trigger,
    handleSubmit,
  } = methods;

  const watchedFields = watch();

  const onSubmit = async (data, fieldKey = null) => {
    try {
      if (fieldKey) {
        const isValid = await trigger(fieldKey);
        if (isValid) {
          const value = methods.getValues(fieldKey);
          const apiData = {
            type: 'Tag price config',
            key: fieldKey,
            value,
          };
          const response = await ApiCalling.apiCallPatch('global_config', apiData);
          if (response && response.data) {
            getConfigData();
            ToasteMessage(response.data.message, 'success');
          } else {
          }
        }
      }
    } catch (error) {
      console.error(error);
      reset();
    }
  };

  return (
    <Card>
      <CardContent>
        <Paper sx={{ m: 1, p: 1, mt: 0 }}>
          <FormProvider methods={methods}>
            <Stack spacing={2} sx={{ mb: 2 }}>
              {filteredValues.map((item) =>
                item.type === 'Tag price config' ? (
                  <div key={item._id}>
                    <Typography variant="h6">
                      {item.key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Typography>
                    <RHFTextField
                      name={item.key}
                      type="number"
                    />
                    {hasPermission('globalConfig.update') && (
                      <div className="text-end">
                        <LoadingButton
                          color="inherit"
                          size="small"
                          variant="soft"
                          onClick={handleSubmit((data) => onSubmit(data, item.key))}
                          sx={{ mt: 1 }}
                          disabled={!watchedFields[item.key]}
                        >
                          Update{' '}
                        </LoadingButton>
                      </div>
                    )}
                  </div>
                ) : null
              )}
            </Stack>
          </FormProvider>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default TagPriceConfig;
