import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';
import { TextField, FormHelperText } from '@mui/material';

export default function RHFDatePicker({ name, label, initialValue, helperText, ...other }) {
  const { control } = useFormContext();
  const parsedInitialValue = initialValue ? new Date(initialValue) : null;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <DatePicker
            {...field}
            label={label}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={error ? error.message : helperText}
                fullWidth
              />
            )}
            value={field.value || null}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: error ? 'error.main' : 'default',
                },
                '&:hover fieldset': {
                  borderColor: error ? 'error.main' : 'default',
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? 'error.main' : 'default',
                },
              },
            }}
            {...other}
          />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error.message : helperText}</FormHelperText>
          )}
        </div>
      )}
      defaultValue={parsedInitialValue}
    />
  );
}

RHFDatePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  initialValue: PropTypes.string,
};
