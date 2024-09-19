/* eslint-disable no-restricted-globals */
import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { TimePicker } from '@mui/x-date-pickers';
import { TextField, FormHelperText } from '@mui/material';

export default function RHFTimePicker({ name, label, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <TimePicker
            {...field}
            label={label}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={error ? error.message : helperText}
                fullWidth
              />
            )}
            // eslint-disable-next-line no-restricted-globals
            value={
              field.value && !isNaN(new Date(field.value).getTime()) ? new Date(field.value) : null
            }
            onChange={(newValue) => {
              if (newValue && !isNaN(new Date(newValue).getTime())) {
                field.onChange(newValue.toISOString());
              } else {
                field.onChange(null);
              }
            }}
            {...other}
          />
          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error.message : helperText}</FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFTimePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
};
