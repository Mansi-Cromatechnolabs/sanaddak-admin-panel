import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function RHFDropdown({
  name,
  label,
  options,
  helperText,
  valueKey = 'value',
  labelKey = 'label',
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={(_, value) => field.onChange(value[valueKey])}
          options={options}
          getOptionLabel={(option) => option[labelKey] || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!error}
              helperText={error ? error.message : helperText}
              {...other}
            />
          )}
        />
      )}
    />
  );
}

RHFDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  helperText: PropTypes.string,
  getOptionLabel: PropTypes.string,
  valueKey: PropTypes.string.isRequired, // Key for the value in options
  labelKey: PropTypes.string.isRequired,
};

// ----------------------------------------------------------------------

export function getCountry(inputValue) {
  const option = countries.filter((country) => country.label === inputValue)[0];

  return {
    ...option,
  };
}
