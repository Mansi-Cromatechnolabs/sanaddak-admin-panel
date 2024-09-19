/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFTextArea({ name, helperText, onKeyPress, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          multiline
          rows={4} // You can adjust the default number of rows here
          value={field.value || ''}
          onChange={(event) => {
            field.onChange(event.target.value);
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          onKeyPress={onKeyPress}
          {...other}
        />
      )}
    />
  );
}

RHFTextArea.propTypes = {
  helperText: PropTypes.node,
  name: PropTypes.string.isRequired,
  onKeyPress: PropTypes.func,
};
