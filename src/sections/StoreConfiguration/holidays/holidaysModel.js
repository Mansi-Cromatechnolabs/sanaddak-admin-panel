/* eslint-disable no-restricted-globals */
/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { handleLoader } from 'src/utils/loader';
import { formatUTCDateString } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFDatePicker } from 'src/components/hook-form';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function HolidaysModel({ open, onClose, onSave, editValue, storeId }) {
  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const HolidaysSchema = Yup.object().shape({
    name: Yup.string().required(' Name is required'),
    date: Yup.date().required('Date is required'),
  });

  const defaultValues = {
    name: '',
    date: null,
  };
  const methods = useForm({
    resolver: yupResolver(HolidaysSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    getValues,
  } = methods;

  const watchFields = watch(['name', 'date']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      const { name, date } = data;
      const formattedDate = formatUTCDateString(date);
      const apiAddData = {
        store_id: storeId,
        name,
        holiday_date: formattedDate,
      };
      const apiUpdateData = {
        store_id: storeId,
        name,
        holiday_date: formattedDate,
        id: editValue?._id,
      };
      if (editValue == null) {
        ApiCalling.apiCallPost('appointment/store_holiday', apiAddData)
          .then((res) => {
            if (res.data) {
              setTimeout(() => {
                onSave();
                reset({ name: '', date: null });
                setCustomLoading(false);
                ToasteMessage(res.data.message, 'success');
              }, 2000);
            } else {
              handleLoader(setCustomLoading, false, 500);
            }
          })
          .catch((error) => {
            handleLoader(setCustomLoading, false, 500);
            console.error(error);
          });
      } else if (editValue !== null) {
        ApiCalling.apiCallPatch('appointment/store_holiday', apiUpdateData)
          .then((res) => {
            if (res.data) {
              setTimeout(() => {
                onSave();
                reset({ name: '', date: null });
                setCustomLoading(false);
                ToasteMessage(res.data.message, 'success');
              }, 2000);
            } else {
              handleLoader(setCustomLoading, false, 500);
              console.log('error', res);
            }
          })
          .catch((error) => {
            handleLoader(setCustomLoading, false, 500);
            console.error(error);
          });
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  });

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Holiday's Name"
        type="text"
        name="name"
        inputRef={firstFieldRef}
      />
      <RHFDatePicker
        name="date"
        label="Select Date"
        initialValue={editValue?.holiday_date || null}
      />
      <div className="text-center">
        <LoadingButton
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={customLoading}
          disabled={!isFormValid}
        >
          Save
        </LoadingButton>
      </div>
    </Stack>
  );

  useEffect(() => {
    const { name, date } = getValues();
    setIsFormValid(!!name && !!date);
  }, [watchFields, getValues]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset({ name: '', date: null });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionProps={{
          onEntered: () => {
            if (firstFieldRef.current) {
              firstFieldRef.current.focus();
            }
            if (editValue !== null) {
              const dateObject = new Date(editValue.holiday_date);
              if (!isNaN(dateObject.getTime())) {
                reset({ name: editValue.name, date: dateObject });
              } else {
                console.error('Invalid date format:', editValue.holiday_date);
              }
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            {' '}
            {editValue ? 'Edit' : 'Add'} Holiday
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="pt-2 pb-4">
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
