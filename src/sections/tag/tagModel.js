/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function TagModel({ open, onClose, onSave, editValue }) {
  const router = useRouter();
  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const TagSchema = Yup.object().shape({
    tag: Yup.string().required('Tag is required'),
  });

  const defaultValues = {
    tag: '',
    description: '',
  };
  const methods = useForm({
    resolver: yupResolver(TagSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    handleSubmit,
    setError,
  } = methods;

  const watchFields = watch(['tag', 'description']);

  useEffect(() => {
    const { tag, description } = getValues();
    setIsFormValid(!!tag && description);
  }, [watchFields, getValues]);

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const { tag, description } = data;
      const apiData = {
        tag_id: editValue?._id ? editValue._id : null,
        name: tag,
        description,
      };
      const res = await ApiCalling.apiCallPost('gold_loan/tag', apiData);
      if (res.data) {
        setTimeout(() => {
          router.push(paths.configuration.priceTag(res.data.data._id));
          onSave();
          reset({ tag: '', description: '' });
          setCustomLoading(false);
          ToasteMessage(res.data.message, 'success');
        }, 2000);
      } else {
        handleLoader(setCustomLoading, false, 500);
        console.log('error', res);
        if (res?.response?.data) {
          setError('tag', {
            type: 'manual',
            message: res?.response?.data?.message,
          });
        }
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  };

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Tag"
        type="text"
        name="tag"
        inputRef={firstFieldRef}
      />
      <RHFTextArea
        id="outlined-email"
        label="Description"
        type="text"
        name="description"
        multiline
        row={4}
      />
      <div className="text-center pb-4">
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
          reset({ tag: '', description: '' });
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
              reset({ tag: editValue.name, description: editValue.description });
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            {editValue ? 'Edit' : 'Add'} Tag
          </Typography>
        </DialogTitle>
        <DialogContent className="pt-2">
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            {renderForm}
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
