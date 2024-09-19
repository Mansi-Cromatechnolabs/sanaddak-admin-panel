/* eslint-disable react/no-this-in-sfc */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */

'use client';

import * as Yup from 'yup';
import React, { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import Container from '@mui/material/Container';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import {
  Box,
  Grid,
  Grow,
  Paper,
  Dialog,
  Button,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { formatDateToISO, parseTimeString, convertToTimeFormat } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import { useSettingsContext } from 'src/components/settings';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import { RHFCheckbox, RHFTextField, RHFTimePicker } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import StoreListDropdown from '../StoreListDropdown';

export const DayBox = ({ day, isSelected, onClick }) => (
  <Paper
    elevation={3}
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      padding: 2,
      textAlign: 'center',
      minHeight: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: isSelected ? '2px solid ' : '1px solid',
      borderColor: isSelected
        ? (theme) => theme.palette.text.primary
        : (theme) => theme.palette.text.lightGrey,
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid',
        borderColor: (theme) => theme.palette.text.primary,
      },
    }}
  >
    <Typography
      variant="h3"
      gutterBottom
      color={!day.is_open ? (theme) => theme.palette.text.lightGrey : ''}
    >
      {day.day}
    </Typography>
  </Paper>
);

export default function AppointmentTimeSlotView() {
  const settings = useSettingsContext();
  const [selectedDay, setSelectedDay] = useState(null);
  const [nextBookingDays, setNextBookingDays] = useState('');
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const firstFieldRef = useFocusOnMount();
  const [storeId, setStoreId] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [isConfirmModel, setIsConfirmModel] = useState(false);
  const [slotId, setSlotId] = useState(null);

  useEffect(() => {
    const localStoreId = localStorageGet('loginData')?.store_id;
    if (localStoreId) {
      setStoreId(localStoreId);
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      getDaysOfWeek();
    }
  }, [storeId]);

  useEffect(() => {
    if (selectedDay && storeId) {
      getAppointmentList(selectedDay.toLowerCase());
    }
  }, [selectedDay, storeId]);

  useEffect(() => {
    getNextBookingDays();
  }, []);

  const handleDayClick = (day) => {
    setSelectedDay(day.day);
    getAppointmentList(day.day);
    reset({
      ...methods.getValues(),
      isOpen: day.is_open,
    });
  };

  const getDaysOfWeek = () => {
    const apiData = {
      store_id: storeId,
    };
    ApiCalling.apiCallPost('appointment/days_status', apiData)
      .then((res) => {
        if (res.data) {
          setDaysOfWeek(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getNextBookingDays = () => {
    const apiData = {
      key: 'appointment_show_days',
    };
    ApiCalling.apiCallPost('global_config', apiData)
      .then((res) => {
        if (res.data) {
          setNextBookingDays(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const updateNextBookingDays = () => {
    const apiData = {
      type: 'appointment',
      key: 'appointment_show_days',
      value: nextBookingDays,
    };
    ApiCalling.apiCallPatch('global_config', apiData)
      .then((res) => {
        if (res.data) {
          setNextBookingDays(res.data.data.value);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const TimeSlotSchema = Yup.object().shape({
    slots: Yup.array()
      .of(
        Yup.object().shape({
          start_time: Yup.date().nullable().required('Start Time is required'),
          end_time: Yup.date()
            .nullable()
            .min(Yup.ref('start_time'), 'End Time must be after Start Time')
            .test(
              'is-not-same-time',
              'End Time cannot be the same as Start Time',
              function (end_time) {
                const start_time = this.resolve(Yup.ref('start_time'));
                return (
                  start_time &&
                  end_time &&
                  new Date(start_time).getTime() !== new Date(end_time).getTime()
                );
              }
            )
            .required('End Time is required'),

          max_attendee: Yup.number()
            .required('Number of Slots is required')
            .min(1, 'At least 1 slot'),
        })
      )
      .min(1, 'At least one time slot is required'),
  });

  const defaultValues = {
    isOpen: false,
    slots: [{ id: null, start_time: null, end_time: null, max_attendee: 0 }],
    next_booking_days: '',
  };
  const methods = useForm({
    resolver: yupResolver(TimeSlotSchema),
    defaultValues,
  });
  const { control, handleSubmit, reset, getValues } = methods;
  const isOpen = useWatch({
    control,
    name: 'isOpen',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slots',
  });
  const slots = useWatch({ control, name: 'slots' });

  const getAppointmentList = async (day) => {
    setCustomLoading(false);
    setSelectedDayId(null);
    reset({
      ...methods.getValues(),
      slots: [{ start_time: null, end_time: null, max_attendee: 0 }],
    });
    if (!storeId) {
      console.error('Store ID is missing.');
      return;
    }

    const apiData = {
      store_id: storeId,
      day: day?.toLowerCase(),
    };
    await ApiCalling.apiCallPost('appointment/time_slot', apiData)
      .then((res) => {
        if (res.data) {
          setSelectedDayId(res.data.data._id);
          const time_slots = res.data.data.timeslots;
          if (time_slots.length === 0) {
            reset({
              ...methods.getValues(),
              slots: [{ start_time: null, end_time: null, max_attendee: 0 }],
              isOpen: res.data.data.is_open,
            });
          } else {
            const formattedSlots = time_slots?.map((slot) => ({
              id: slot._id,
              start_time: formatDateToISO(parseTimeString(slot.start_time)),
              end_time: formatDateToISO(parseTimeString(slot.end_time)),
              max_attendee: slot.max_attendee,
            }));

            reset({
              isOpen: res.data.data.is_open,
              slots: formattedSlots,
            });
          }
        } else {
          console.log('error');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        day_master_id: selectedDayId,
        store_id: storeId,
        day: selectedDay.toLowerCase(),
        is_open: data.isOpen,
        slots: data.isOpen
          ? data.slots.map((slot) => ({
            ...slot,
            id: slot.id,
            start_time: convertToTimeFormat(slot.start_time),
            end_time: convertToTimeFormat(slot.end_time),
            max_attendee: slot.max_attendee,
          }))
          : [],
      };
      await ApiCalling.apiCallPost('appointment/appointment_availability', apiData)
        .then((res) => {
          if (res.data) {
            getAppointmentList(selectedDay.toLowerCase());
            getDaysOfWeek();
            setTimeout(() => {
              setCustomLoading(false);
              reset();
              ToasteMessage(res.data.message, 'success');
            }, 2000);
          } else {
            console.log('error');
            handleLoader(setCustomLoading, false, 500);
          }
        })
        .catch((error) => {
          console.error(error);
          handleLoader(setCustomLoading, false, 500);
        });
    } catch (error) {
      console.error(error);
      handleLoader(setCustomLoading, false, 500);
    }
  });

  const handleRemove = async (index) => {
    const id = slots[index]?.id;
    try {
      if (id) {
        setIsConfirmModel(true);

        setSlotId(id);
      } else {
        remove(index);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderForm = (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ p: 3 }}>
          <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3">Settings for {selectedDay}</Typography>
          </Box>
          <Box mb={3}>
            <RHFCheckbox name="isOpen" label="Is Open Store" />
          </Box>
          {isOpen && (
            <Box mb={3}>
              {fields.map((item, index) => (
                <Grid container spacing={3} key={item.id || index} mb={3}>
                  <Grid item xs={12} sm={3}>
                    <RHFTimePicker name={`slots[${index}].start_time`} label="Start Time" />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <RHFTimePicker name={`slots[${index}].end_time`} label="End Time" />
                  </Grid>
                  <Grid item xs={12} sm={3} lg={4}>
                    <RHFTextField
                      name={`slots[${index}].max_attendee`}
                      label="Number of Slots"
                      type="number"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={2}
                    lg={2}
                    display="flex"
                    justifyContent="between"
                    alignItems="center"
                  >
                    {fields.length > 1 && (
                      <IconButton color="error" onClick={() => handleRemove(index)}>
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                    <IconButton
                      color="primary"
                      onClick={() =>
                        append({
                          id: null,
                          start_time: null,
                          end_time: null,
                          max_attendee: 0,
                        })
                      }
                    >
                      <AddCircleOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
          )}
          <Grid item xs={12} textAlign="right">
            <LoadingButton
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSubmit(onSubmit)}
              loading={customLoading}
              disabled={!isFormValid}
            >
              Save
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );

  const handleDeleteSlots = async () => {
    if (slotId) {
      const apiData = { id: slotId };
      try {
        await ApiCalling.apiCallDelete('appointment/time_slot', apiData).then((res) => {
          if (res.data) {
            setIsConfirmModel(false);
            ToasteMessage(res.data.message, 'success');
            getAppointmentList(res.data.data.day.day);
          } else {
            console.log('error');
          }
        });
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  useEffect(() => {
    const allFieldsValid = slots.every(
      (field) => field && field.start_time && field.end_time && field.max_attendee > 0
    );

    setIsFormValid(allFieldsValid);
  }, [slots, getValues]);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Appointment Time slot"
          links={[{ name: '' }]}
          sx={{
            mb: { xs: 3, md: 3.5 },
          }}
        />
        <Grid item xs={12} md={3} display="flex" alignItems="center" gap={2} mb={4}>
          <StoreListDropdown
            inputRef={firstFieldRef}
            storeId={storeId || ''}
            setStoreId={setStoreId}
          />
          <TextField
            sx={{ minWidth: 250 }}
            name="next_booking_days"
            label="NEXT APPOINTMENT BOOKING DAYS"
            value={nextBookingDays}
            onChange={(e) => {
              setNextBookingDays(e.target.value);
            }}
            onBlur={() => updateNextBookingDays()}
          />
        </Grid>
        <Grid container spacing={3}>
          {daysOfWeek.map((day, i) => (
            <Grid item xs={12} sm={3} md={2.2} lg={4} xl={1.7} key={i}>
              <DayBox
                day={day}
                isSelected={selectedDay === day.day}
                onClick={() => handleDayClick(day)}
              />
            </Grid>
          ))}
        </Grid>

        {selectedDay && (
          <FormProvider methods={methods} onSubmit={onSubmit}>
            {renderForm}
          </FormProvider>
        )}
        <Dialog
          open={isConfirmModel}
          onClose={() => {
            setIsConfirmModel(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ '& .MuiDialog-paper': { width: '80%' } }}
          maxWidth="xs"
          TransitionComponent={Grow}
        >
          <DialogTitle id="alert-dialog-title">
            {' '}
            <Typography fontWeight={600} fontSize={16}>
              Confirm
            </Typography>
          </DialogTitle>
          <DialogContent>
            <div className="pb-3">Are you sure you want to Delete this slot?</div>

            <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
              <Button
                variant="text"
                onClick={() => {
                  setIsConfirmModel(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton variant="soft" onClick={() => handleDeleteSlots(slotId)}>
                Confirm
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  );
}
