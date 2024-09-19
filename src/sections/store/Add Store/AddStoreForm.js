'use client';

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable eqeqeq */
/* eslint-disable arrow-body-style */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-else-return */
/* eslint-disable no-debugger */
/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import L from 'leaflet';
import * as Yup from 'yup';
import 'leaflet/dist/leaflet.css';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import 'react-international-phone/style.css';
import React, { useState, useEffect } from 'react';
/* eslint-disable react/no-unstable-nested-components */
import { yupResolver } from '@hookform/resolvers/yup';
import { PhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { parse, format, isValid, isBefore } from 'date-fns';
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { TimePicker } from '@mui/x-date-pickers';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import {
  Grid,
  Paper,
  Button,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  FormHelperText,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { convertToUTC, formattedTime } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFDatePicker } from 'src/components/hook-form';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

import { removeCountryCode } from 'src/sections/User/User-add-edit';

const customSVGIcon = `
<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C7.02944 2 3 6.02944 3 11C3 16.621 12 22 12 22C12 22 21 16.621 21 11C21 6.02944 16.9706 2 12 2ZM12 14.5C10.0147 14.5 8.5 13.0853 8.5 11C8.5 8.91472 10.0147 7.5 12 7.5C13.9853 7.5 15.5 8.91472 15.5 11C15.5 13.0853 13.9853 14.5 12 14.5Z" fill="red"/>
</svg>
`;

const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(customSVGIcon)}`,
  iconSize: [30, 49],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const daysOfWeek = [
  { day: 'Monday', is_open: true, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
  { day: 'Tuesday', is_open: false, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
  {
    day: 'Wednesday',
    is_open: false,
    slots: [{ startTime: null, endTime: null, maxAttendee: '' }],
  },
  { day: 'Thursday', is_open: false, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
  { day: 'Friday', is_open: false, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
  { day: 'Saturday', is_open: false, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
  { day: 'Sunday', is_open: false, slots: [{ startTime: null, endTime: null, maxAttendee: '' }] },
];

function AddStoreForm() {
  const router = useRouter();
  const [center, setCenter] = useState([51.505, -0.09]);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errors, setErrors] = useState([]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [storeDays, setStoreDays] = useState(daysOfWeek);

  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const handleDayClick = (day, index) => {
    setSelectedDayIndex(index);
  };

  const handleIsOpenChange = (index) => {
    const updatedDays = [...storeDays];
    updatedDays[index].is_open = !updatedDays[index].is_open;
    setStoreDays(updatedDays);
    setErrors([]);
  };

  const handleFieldChange = (dayIndex, fieldIndex, field, value) => {
    const updatedDays = [...storeDays];
    updatedDays[dayIndex].slots[fieldIndex][field] = value;

    setStoreDays(updatedDays);
    setErrors([]);
  };

  const addTimeField = (index) => {
    const updatedDays = [...storeDays];
    updatedDays[index].slots.push({ startTime: null, endTime: null, maxAttendee: '' });
    setStoreDays(updatedDays);
    setErrors([]);
  };

  const removeTimeField = (dayIndex, fieldIndex) => {
    const updatedDays = [...storeDays];
    if (updatedDays[dayIndex].slots.length > 1) {
      updatedDays[dayIndex].slots.splice(fieldIndex, 1);
      setStoreDays(updatedDays);
      setErrors([]);
    }
  };

  const firstFieldRef = useFocusOnMount();

  const phoneUtil = PhoneNumberUtil.getInstance();

  const handlePhoneNumberChange = (phone) => {
    setPhoneNumber(phone);

    try {
      const parsedNumber = phoneUtil.parse(phone);
      const countrycode = parsedNumber.getCountryCode();
      const dialcode = `+${countrycode}`;

      setCountryCode(dialcode);
    } catch (error) {
    }
  };
  const isValidPhone = (phone) => {
    try {
      const parsedNumber = phoneUtil.parse(phone);
      return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
      return false;
    }
  };

  const defaultValues = {
    storeName: '',
    storeAddress: '',
    storeOwnerFirstName: '',
    storeOwnerLastName: '',
    storeOwnerEmail: '',
    storeAdvanceBookingDays: '',

    holiday_details: [
      {
        name: '',
        holiday_date: null,
      },
    ],
  };
  const addStoreSchema = Yup.object().shape({
    storeName: Yup.string().required('Store Name is required'),
    storeAddress: Yup.string().required('Store Address is required'),
    storeOwnerFirstName: Yup.string().required('First Name is required'),
    storeOwnerLastName: Yup.string().required('Last Name is required'),
    storeOwnerEmail: Yup.string().email('Invalid email').required('Email is required'),
  });

  const methods = useForm({
    resolver: yupResolver(addStoreSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    getValues,
  } = methods;

  const holidayDetails = watch('holiday_details');

  const watchFields = watch([
    'storeName',
    'storeAddress',
    'storeOwnerFirstName',
    'storeOwnerLastName',
    'storeOwnerEmail',
  ]);

  const handleAddHolidays = () => {
    const currentHolidays = getValues('holiday_details');
    const newHoliday = { name: '', holiday_date: null };

    setValue('holiday_details', [...currentHolidays, newHoliday]);
  };

  const handleRemoveHolidays = (index) => {
    const currentHolidays = getValues('holiday_details');
    const updatedHolidays = currentHolidays.filter((_, i) => i !== index);

    setValue('holiday_details', updatedHolidays);
  };

  const customizeDaysArray = (storeDays) =>
    storeDays.map((day) => {
      const filteredSlots = day.slots.filter(
        (field) => field.startTime !== null && field.endTime !== null && field.maxAttendee !== ''
      );

      const formattedSlots = filteredSlots.map((field) => ({
        start_time: formattedTime(field.startTime),
        end_time: formattedTime(field.endTime),
        max_attendee: field.maxAttendee,
      }));

      const isDayOpen = formattedSlots.length > 0 && day.is_open;

      return {
        day: day.day.toLowerCase(),
        is_open: isDayOpen,
        slots: isDayOpen ? formattedSlots : [],
      };
    });

  const onSubmit = handleSubmit((data) => {
    try {
      let error = false;
      if (position === null) {
        setLocationError('Please Select Location');
        error = true;
      }
      if (!phoneNumber) {
        setPhoneError('Phone number is required');
        error = true;
      } else if (!isValidPhone) {
        setPhoneError('Please enter valid phone');
        error = true;
      }

      if (!error) {
        setCustomLoading(true);
        const customizedDays = customizeDaysArray(storeDays);
        const formattedHolidayDetails = data?.holiday_details
          ?.filter((d) => d.holiday_date !== null)
          .map((d) => ({
            name: d.name,
            holiday_date: convertToUTC(d.holiday_date),
          }));

        const holidayDetails = formattedHolidayDetails?.length ? formattedHolidayDetails : [];
        const apiData = {
          name: data.storeName,
          address: data.storeAddress,
          location: {
            country: address.country,
            region: address.state,
            city: address.city,
            latitude: position[0],
            longitude: position[1],
          },
          store_owner_details: {
            first_name: data.storeOwnerFirstName,
            last_name: data.storeOwnerLastName,
            email: data.storeOwnerEmail,
            country_code: countryCode,
            phone: removeCountryCode(phoneNumber, countryCode),
          },
          holiday_details: holidayDetails,
          days_avaibility: customizedDays,
        };
        ApiCalling.apiCallPost('branch/register', apiData)
          .then((res) => {
            if (res.data) {
              router.push(paths.store);
              setTimeout(() => {
                setCustomLoading(false);
                ToasteMessage(res.data.message, 'success');
              }, 2000);
            } else {
              handleLoader(setCustomLoading, false, 500);
            }
          })
          .catch((error) => {
            handleLoader(setCustomLoading, false, 500);
            console.log(error);
          });
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
    }
  });
  const handleMapClick = async (latlng) => {
    if (!latlng) return;
    const { lat, lng } = latlng;
    setPosition([lat, lng]);
    setLocationError('');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    const data = await response.json();
    if (data && data.address) {
      const { country, state, county, city, suburb } = data.address;
      const addressData = {
        country,
        state: state || county || suburb,
        city: city || suburb,
      };

      setAddress(addressData);
    } else {
      setAddress('Address not found');
    }
  };
  const LocationMarker = ({ position, address }) => {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={customIcon}>
        <Popup>{address}</Popup>
      </Marker>
    );
  };
  useEffect(() => {
    if (window) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('LAT LONG', pos.coords.latitude, pos.coords.longitude);
          setCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error(err);
          setLocationError('Unable to retrieve location');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const { storeName, storeAddress, storeOwnerFirstName, storeOwnerLastName, storeOwnerEmail } =
      getValues();
    setIsFormValid(
      !!storeName &&
      !!storeAddress &&
      !!storeOwnerFirstName &&
      !!storeOwnerLastName &&
      !!storeOwnerEmail
    );
  }, [watchFields, getValues]);

  const handleSave = () => {
    let hasError = false;
    const newErrors = [];

    const updatedDays = storeDays.map((day, dayIndex) => {
      if (day.is_open) {
        const validFields = [];
        const dayErrors = { slots: [] };

        day.slots.forEach((field, fieldIndex) => {
          const { startTime, endTime, maxAttendee } = field;

          const fieldErrors = {};

          if (!startTime) {
            hasError = true;
            fieldErrors.startTime = 'Start time is required';
          }

          if (!endTime) {
            hasError = true;
            fieldErrors.endTime = 'End time is required';
          }

          if (startTime && endTime) {
            const startTimeParsed = parse(startTime, 'hh:mm a', new Date());
            const endTimeParsed = parse(endTime, 'hh:mm a', new Date());

            if (isBefore(endTimeParsed, startTimeParsed)) {
              hasError = true;
              fieldErrors.endTime = 'End time cannot be earlier than start time or same';
            }
            if (startTime === endTime) {
              hasError = true;
              fieldErrors.endTime = 'End time cannot be earlier than start time or same';
            }
          }
          if (!maxAttendee) {
            hasError = true;
            fieldErrors.maxAttendee = 'Max attendee is required';
          } else if (maxAttendee < 1) {
            hasError = true;
            fieldErrors.maxAttendee = 'Max attendee must be greater than 1';
          }

          if (Object.keys(fieldErrors).length > 0) {
            dayErrors.slots[fieldIndex] = fieldErrors;
          } else {
            validFields.push(field);
          }
        });

        if (validFields.length === day.slots.length) {
          return { ...day, slots: validFields };
        } else {
          newErrors[dayIndex] = dayErrors;
          return day;
        }
      }
      return day;
    });

    setErrors(newErrors);

    if (!hasError) {
      setStoreDays(updatedDays);
      ToasteMessage('Time Slot Added', 'success');
    }
  };

  const renderStoreDetailForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Store name"
        type="text"
        name="storeName"
        inputRef={firstFieldRef}
      />
      <RHFTextArea id="outlined-email" label="Store address" type="text" name="storeAddress" />
      {center && (
        <>
          <MapContainer
            center={center}
            zoom={13}
            style={{
              height: '200px',
              width: '100%',
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} address={address} />
          </MapContainer>
          {locationError && (
            <FormHelperText sx={{ mt: '-11px', fontSize: '14px', fontWeight: 500 }} error="true">
              {locationError}
            </FormHelperText>
          )}
        </>
      )}
    </Stack>
  );
  const renderStoreOwnerDetail = (
    <Stack spacing={2.5}>
      <RHFTextField id="outlined-email" label="First name" type="text" name="storeOwnerFirstName" />
      <RHFTextField id="outlined-email" label="Last name" type="text" name="storeOwnerLastName" />
      <RHFTextField id="outlined-email" label="Email adress" type="text" name="storeOwnerEmail" />
      <PhoneInput
        defaultCountry="in"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        style={{ width: '100%', zIndex: 11 }}
      />

      {!isValidPhone && (
        <FormHelperText sx={{ mt: '-11px' }} error="true">
          {phoneError}
        </FormHelperText>
      )}

      <Grid item xs={12} sm={12} md={12}>
        <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
          Store Advance Booking Days (optional)
        </Typography>
        <Stack spacing={2.5}>
          <RHFTextField name="storeAdvanceBookingDays" label="Advance Booking Days" />
        </Stack>
      </Grid>
    </Stack>
  );

  const renderDayAvailabilityForm = (
    <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
      {storeDays[selectedDayIndex] && (
        <>
          <Typography variant="h6" mb={2}>
            Settings for {storeDays[selectedDayIndex].day}
          </Typography>
          <Checkbox
            sx={{ ml: -1.25 }}
            checked={storeDays[selectedDayIndex].is_open}
            onChange={() => handleIsOpenChange(selectedDayIndex)}
          />
          Is open store?
          {storeDays[selectedDayIndex].is_open && (
            <Box sx={{ mt: 2 }}>
              {storeDays[selectedDayIndex].slots.map((field, fieldIndex) => {
                const parseTime = (timeString) => {
                  const parsedTime = parse(timeString, 'hh:mm a', new Date());
                  return isValid(parsedTime) ? parsedTime : null;
                };

                const formatTime = (date) => {
                  return format(date, 'hh:mm a');
                };

                return (
                  <Grid container spacing={1} key={fieldIndex} alignItems="center" mb={2}>
                    <Grid item xs={4}>
                      <TimePicker
                        label="Start Time"
                        value={
                          storeDays[selectedDayIndex].slots[fieldIndex].startTime
                            ? parseTime(storeDays[selectedDayIndex].slots[fieldIndex].startTime)
                            : null
                        }
                        sx={{ width: '100%' }}
                        onChange={(newTime) => {
                          if (newTime && !isNaN(new Date(newTime).getTime())) {
                            const formattedTime = formatTime(newTime);
                            handleFieldChange(
                              selectedDayIndex,
                              fieldIndex,
                              'startTime',
                              formattedTime
                            );
                          } else {
                            handleFieldChange(selectedDayIndex, fieldIndex, 'startTime', '');
                          }
                        }}
                      />
                      {!!errors[selectedDayIndex]?.slots[fieldIndex]?.startTime && (
                        <FormHelperText error>
                          {errors[selectedDayIndex]?.slots[fieldIndex]?.startTime}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={4}>
                      <TimePicker
                        label="End Time"
                        value={
                          storeDays[selectedDayIndex].slots[fieldIndex].endTime
                            ? parseTime(storeDays[selectedDayIndex].slots[fieldIndex].endTime)
                            : null
                        }
                        sx={{ width: '100%' }}
                        onChange={(newTime) => {
                          if (newTime && !isNaN(new Date(newTime).getTime())) {
                            const formattedTime = formatTime(newTime);
                            handleFieldChange(
                              selectedDayIndex,
                              fieldIndex,
                              'endTime',
                              formattedTime
                            );
                          } else {
                            handleFieldChange(selectedDayIndex, fieldIndex, 'endTime', '');
                          }
                        }}
                      />
                      {!!errors[selectedDayIndex]?.slots[fieldIndex]?.endTime && (
                        <FormHelperText error>
                          {errors[selectedDayIndex]?.slots[fieldIndex]?.endTime}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="No of slots"
                        type="number"
                        value={field.maxAttendee}
                        onChange={(e) =>
                          handleFieldChange(
                            selectedDayIndex,
                            fieldIndex,
                            'maxAttendee',
                            e.target.value
                          )
                        }
                        fullWidth
                        error={!!errors[selectedDayIndex]?.slots[fieldIndex]?.maxAttendee}
                        helperText={errors[selectedDayIndex]?.slots[fieldIndex]?.maxAttendee || ''}
                      />
                    </Grid>
                    <Grid item xs={0.5}>
                      <IconButton onClick={() => addTimeField(selectedDayIndex)}>
                        <AddCircleOutline />
                      </IconButton>
                    </Grid>

                    <Grid item xs={0.5}>
                      {storeDays[selectedDayIndex].slots.length > 1 && (
                        <IconButton onClick={() => removeTimeField(selectedDayIndex, fieldIndex)}>
                          <RemoveCircleOutline />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                );
              })}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );

  const renderHolidaysForm = (
    <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
      {holidayDetails.map((field, index) => (
        <Grid container spacing={2} key={index} mb={2}>
          <Grid item xs={5}>
            <RHFTextField name={`holiday_details[${index}].name`} label="Holiday name" />
          </Grid>
          <Grid item xs={5}>
            <RHFDatePicker name={`holiday_details[${index}].holiday_date`} label="Holiday date" />
          </Grid>
          <Grid item xs={2} display="flex" alignItems="center">
            <IconButton onClick={handleAddHolidays}>
              <AddCircleOutline />
            </IconButton>
            {holidayDetails?.length > 1 && (
              <IconButton onClick={() => handleRemoveHolidays(index)}>
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Grid>
        </Grid>
      ))}
    </Paper>
  );

  return (
    <Paper sx={{ border: (theme) => `1px solid ${theme.palette.text.lightGrey}`, p: 2 }}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
              Store Detail
            </Typography>

            {renderStoreDetailForm}
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
              Store Owner Detail
            </Typography>
            {renderStoreOwnerDetail}
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
              Store Availability (optional)
            </Typography>
            <Grid container spacing={3}>
              {storeDays.map((day, i) => (
                <Grid item xs={12} sm={6} md={4} lg={1.7} key={i}>
                  <Paper
                    elevation={3}
                    onClick={() => handleDayClick(day.day, i)}
                    sx={{
                      cursor: 'pointer',
                      padding: 2,
                      textAlign: 'center',
                      minHeight: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: selectedDayIndex === i ? '2px solid ' : '1px solid',
                      borderColor:
                        selectedDayIndex === i
                          ? (theme) => theme.palette.text.primary
                          : (theme) => theme.palette.text.lightGrey,
                      boxShadow: 'none',
                      '&:hover': {
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.text.primary,
                      },
                    }}
                  >
                    <Typography variant="h3" gutterBottom>
                      {day.day}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {renderDayAvailabilityForm}
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
              Store Holidays (optional)
            </Typography>

            {renderHolidaysForm}
          </Grid>
        </Grid>
        <Box textAlign="center" mt={2}>
          <LoadingButton
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={customLoading}
            sx={{ minWidth: 200 }}
            disabled={!isFormValid}
          >
            Save Store
          </LoadingButton>
        </Box>
      </FormProvider>
    </Paper>
  );
}
export default AddStoreForm;
