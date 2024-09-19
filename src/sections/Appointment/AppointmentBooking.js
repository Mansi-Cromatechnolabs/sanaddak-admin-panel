'use client';

/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */

import * as Yup from 'yup';
import moment from 'moment';
import Slider from 'react-slick';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {
  Grid,
  Card,
  Grow,
  Paper,
  Select,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  CardContent,
  DialogTitle,
  ListSubheader,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { AppointmentStatus } from 'src/ENUMS/enums';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function AppointmentBooking({ open, onClose, onSave }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  const formatDay = (day) => {
    return day.slice(0, 3);
  };

  const [searchText, setSearchText] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [slotDetails, setSlotDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formError, setFormError] = useState('');
  const [isBookingSuccess, setIsBookingSucessModel] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const firstFieldRef = useFocusOnMount();

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); 
  };

  const handleSlotClick = (slotId) => {
    setSelectedSlot((prevSlot) => (prevSlot === slotId ? null : slotId));
  };

  const selectedDateSlots = slotDetails.find((s) => s.date === selectedDate)?.slots || [];

  const AppointmentSchema = Yup.object().shape({
    selectedOption: Yup.string().required('Customer must be selected'),
  });

  const methods = useForm({
    resolver: yupResolver(AppointmentSchema),
    defaultValues: {
      selectedOption: '',
    },
  });
  const { reset, watch, control, getValues, trigger } = methods;
  const watchFields = watch(['selectedOption']);

  const validateFields = async () => {
    const isCustomerValid = await trigger('selectedOption');
    if (!selectedDate) {
      setFormError('Please select a date.');
      return false;
    }
    if (!selectedSlot) {
      setFormError('Please select a time slot.');
      return false;
    }
    if (!isCustomerValid) {
      setFormError('Please select a customer.');
      return false;
    }

    setFormError('');
    return true;
  };
  const handleAppointmentBook = async () => {
    setCustomLoading(true);
    try {
      const isValid = await validateFields();
      if (isValid) {
        const apiData = {
          store_id: localStorageGet('loginData')?.store_id,
          time_slot_id: selectedSlot,
          booking_date: selectedDate,
          appointment_type: AppointmentStatus.VALUATION,
          valuation_id: [],
        };
        ApiCalling.apiCallPost(
          `appointment/book_appointment?customer_id=${getValues('selectedOption')}`,
          apiData
        )
          .then((res) => {
            if (res.data) {
              onClose();
              setBookingDetails(res.data.data);
              setIsBookingSucessModel(true);
              onSave();
              reset();
              setSelectedDate('');
              setSelectedSlot('');
              ToasteMessage(res?.data?.message, 'success');
              setTimeout(() => {
                setCustomLoading(false);
              }, 500);
            } else {
              handleLoader(setCustomLoading, false, 500);
            }
          })
          .catch((error) => {
            console.error(error);
            handleLoader(setCustomLoading, false, 500);
          });
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (err) {
      console.log(err);
      handleLoader(setCustomLoading, false, 500);
    }
  };

  const getSlotDetails = () => {
    const apiData = {
      store_id: localStorageGet('loginData')?.store_id,
    };
    ApiCalling.apiCallPost('appointment/get_appointment_slot_details', apiData)
      .then((res) => {
        if (res.data) {
          setSlotDetails(res.data.data);
          setSelectedDate(res.data.data[0]?.date);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    if (localStorageGet('loginData')?.store_id) {
      getSlotDetails();
    }
  }, [localStorageGet('loginData')?.store_id]);

  const getCustomerList = () => {
    ApiCalling.apiCallPost('customer/customer_list')
      .then((res) => {
        if (res.data) {
          setCustomerList(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getCustomerList();
  }, []);

  useEffect(() => {
    const { selectedOption } = getValues();
    setIsFormValid(!!selectedOption && !!selectedDate);
  }, [watchFields, getValues]);

  const renderCustomerDropdown = (
    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
      <InputLabel id="search-select-label">Select Cutomer</InputLabel>
      <Controller
        name="selectedOption"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Select
              {...field}
              inputRef={firstFieldRef}
              MenuProps={{
                autoFocus: false,
                PaperProps: {
                  style: {
                    maxHeight: 230,
                    width: 200,
                  },
                },
              }}
              labelId="search-select-label"
              id="search-select"
              label="Select Cutomer"
              onClose={() => setSearchText('')}
              renderValue={(selectedId) => {
                const selectCustomer = customerList.find((customer) => customer._id === selectedId);
                return selectCustomer
                  ? `${selectCustomer.first_name} ${selectCustomer.last_name}`
                  : '';
              }}
              onChange={(e) => {
                const customerId = e.target.value;
                field.onChange(customerId);
                trigger('selectedOption');
              }}
            >
              <ListSubheader>
                <TextField
                  size="small"
                  autoFocus
                  placeholder="Type to search..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Escape') {
                      e.stopPropagation();
                    }
                  }}
                />
              </ListSubheader>
              {customerList
                .filter((option) =>
                  `${option.first_name} ${option.last_name}`
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                )
                .map((option, i) => (
                  <MenuItem key={i} value={option._id}>
                    {`${option.first_name} ${option.last_name}`}
                  </MenuItem>
                ))}
            </Select>
            {error && <p style={{ color: 'red', fontSize: '12px' }}>{error.message}</p>}
          </>
        )}
      />
    </FormControl>
  );
  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset({ tenure: '' });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontSize={16} fontWeight={600} color={(theme) => theme.palette.text.primary}>
            New Appointment Booking
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormProvider methods={methods}> {renderCustomerDropdown}</FormProvider>

          {slotDetails?.length > 0 && (
            <>
              <Typography variant="h3" color={(theme) => theme.palette.text.primary}>
                Select date & time for an appointment
              </Typography>
              <div className="p-4">
                <Slider {...settings}>
                  {slotDetails?.map((s, i) => {
                    return (
                      <Grid container spacing={1} key={i}>
                        <Grid item>
                          <Paper
                            onClick={() => handleDateClick(s.date)}
                            sx={{
                              padding: 1,
                              border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                              textAlign: 'center',
                              background:
                                selectedDate === s.date
                                  ? 'linear-gradient(81.58deg, #D79129 0.2%, #E49F26 44.7%, #EAAB21 78.82%, #F1B61C 118.87%, #FAC214 148.54%)'
                                  : 'none',
                              '& .MuiTypography-root': {
                                color: selectedDate === s.date ? 'white' : 'black',
                              },
                            }}
                          >
                            <Typography variant="h5">{formatDay(s.day)}</Typography>
                            <Typography>{moment(s.date).format('D MMM')}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Slider>
              </div>
            </>
          )}
          <Typography mt={2} mb={2} variant="h3" color={(theme) => theme.palette.text.gray500}>
            Select time slot
          </Typography>
          <Paper
            sx={{
              border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
              marginBottom: 2,
            }}
          >
            <Box
              sx={{
                height: 200,
                overflow: 'auto',
                padding: 2,
                position: 'relative',
                '&::-webkit-scrollbar': {
                  width: '6px',
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.grey[500],
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.grey[300],
                  borderRadius: '8px',
                },
              }}
            >
              {selectedDate && selectedDateSlots.length > 0 ? (
                <Grid container spacing={2} mb={2}>
                  {selectedDateSlots.map((slot) => (
                    <Grid item xs={6} key={slot.id}>
                      <Card
                        sx={{
                          textAlign: 'center',
                          cursor: slot.available_slots > 0 ? 'pointer' : 'not-allowed',
                          backgroundColor:
                            selectedSlot === slot.id
                              ? '#D79129'
                              : slot.available_slots === 0
                                ? (theme) => theme.palette.text.lightGrey
                                : 'white',
                          '& .MuiTypography-root': {
                            color: selectedSlot === slot.id ? 'white' : 'black',
                          },
                        }}
                        onClick={() => slot.available_slots > 0 && handleSlotClick(slot.id)}
                      >
                        <CardContent>
                          <Typography>{`${slot.start_time} - ${slot.end_time}`}</Typography>
                          <Typography>{`${slot.available_slots} slot${
                            slot.available_slots > 1 ? 's' : ''
                          } available`}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography
                  variant="h3"
                  color={(theme) => theme.palette.text.gray500}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  No time slot Available For {globalUTCFormatDate(selectedDate)}
                </Typography>
              )}

              {formError && (
                <Typography color="error" mb={2}>
                  {formError}
                </Typography>
              )}
            </Box>
          </Paper>
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={customLoading}
            disabled={!isFormValid}
            onClick={handleAppointmentBook}
          >
            Confirm
          </LoadingButton>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isBookingSuccess}
        onClose={() => {
          setIsBookingSucessModel(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <Card elevation={3} sx={{ position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsBookingSucessModel(false);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 60, marginBottom: 1, color: '#BE7509' }} />
            <Typography variant="h1" gutterBottom>
              Confirmed
            </Typography>
            <Typography variant="h6">Appointment has been successfully confirmed.</Typography>

            <Box mt={1} mb={2} textAlign="center">
              <Typography variant="h4" color="textSecondary">
                Appointment Booking No:{' '}
                <Typography variant="span" fontWeight={600}>
                  {bookingDetails?.booking_number}
                </Typography>
              </Typography>
              <Typography variant="h3" mt={1}>
                {globalUTCFormatDate(bookingDetails?.booking_date)} ,{' '}
                {`${bookingDetails?.appointment_start_time} - ${bookingDetails?.appointment_end_time}`}
              </Typography>
            </Box>
            <Divider />
            <Box mb={2} p={2}>
              <Grid container spacing={1}>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Name
                </Grid>
                <Grid item xs={6} textAlign="end" fontWeight={600}>
                  {bookingDetails?.full_name}
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Email
                </Grid>
                <Grid item xs={6} textAlign="end" fontWeight={600}>
                  {bookingDetails?.email}
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Mobile No.
                </Grid>
                <Grid item xs={6} textAlign="end" fontWeight={600}>
                  {bookingDetails?.phone}
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}
