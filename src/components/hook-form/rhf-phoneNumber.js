import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { Controller, useFormContext } from 'react-hook-form';

// eslint-disable-next-line react/prop-types
export default function RHFPhoneNumber({ defaultCountry, name, value, onChange, onCountryChange }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange: onChangeField, value: fieldValue },
        fieldState: { error },
      }) => (
        <div>
          <PhoneInput
            country={defaultCountry}
            value={value || fieldValue}
            onChange={(val, country) => {
              onChange(val);
              // onChangeField(val);
              onCountryChange(country.countryCode);
            }}
            inputClass="custom-flag-input"
            containerClass={`${error ? 'react-tel-input-error' : 'react-tel-input'}`}
          />
          {error && <p className="error-message">{error.message}</p>}
        </div>
      )}
    />
  );
}
