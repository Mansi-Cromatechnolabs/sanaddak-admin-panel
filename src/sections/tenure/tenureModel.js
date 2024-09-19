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

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function TenureModel({ open, onClose, onSave, editValue, list }) {
  const TenureSchema = Yup.object().shape({
    tenure: Yup.string().required('Tenure is required'),
  });

  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const defaultValues = {
    tenure: '',
  };
  const methods = useForm({
    resolver: yupResolver(TenureSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    handleSubmit,
  } = methods;

  const watchFields = watch(['tenure']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      const { tenure } = data;
      if (editValue !== null) {
        const index = list.indexOf(editValue);
        list[index] = tenure;
      } else {
        list.push(tenure);
      }
      const apiData = {
        type: 'appointment',
        key: 'tenure',
        value: list,
      };
      ApiCalling.apiCallPatch('global_config', apiData)
        .then((res) => {
          if (res.data) {
            setTimeout(() => {
              onSave();
              reset({ tenure: '' });
              setCustomLoading(false);
              ToasteMessage('Tenure add/update successfully', 'success');
            }, 1000);
          } else {
            handleLoader(setCustomLoading, false, 500);
            console.log('error', res);
            if (res?.response?.data) {
              reset({ tenure: res?.response?.data?.message });
            }
          }
        })
        .catch((error) => {
          handleLoader(setCustomLoading, false, 500);
          console.error(error);
        });
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  });

  useEffect(() => {
    const { tenure } = getValues();
    setIsFormValid(!!tenure);
  }, [watchFields, getValues]);

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Tenure(in months)"
        type="number"
        name="tenure"
        inputRef={firstFieldRef}
      />
      <div className="text-center pb-3">
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

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset({ tenure: '' });
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
              reset({ tenure: editValue });
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            {editValue ? 'Edit' : 'Add'} Tenure
          </Typography>
        </DialogTitle>

        <DialogContent>
          <div className="pt-2 pb-3">
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
