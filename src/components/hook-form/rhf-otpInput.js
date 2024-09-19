/* eslint-disable jsx-a11y/label-has-associated-control */
import OTPInput from 'react-otp-input';
import { Controller, useFormContext } from 'react-hook-form';

// eslint-disable-next-line react/prop-types
export default function RHFOTPInput({ name }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <label className="mb-2">Enter OTP</label>
          <OTPInput
            inputType="number"
            inputStyle={{ width: '100%', height: '40px' }}
            value={field.value}
            onChange={field.onChange}
            numInputs={6}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
            shouldAutoFocus
          />

          {error && <p className="error-message mt-2">{error.message}</p>}
        </div>
      )}
    />
  );
}
