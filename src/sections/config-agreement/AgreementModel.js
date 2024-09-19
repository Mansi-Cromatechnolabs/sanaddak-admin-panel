'use client';

import * as Yup from 'yup';
/* eslint-disable react/prop-types */
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Grid, Paper, Button, Typography, FormHelperText } from '@mui/material';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Editor from 'src/components/editor/editor';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function AgreementModel({ open, onClose, editValue, onEdit }) {
  const [quillFull, setQuillFull] = useState('');
  const [error, setError] = useState('');
  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const agreementSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    priority: Yup.number().required('Priority is required'),
  });

  const defaultValues = {
    name: '',
    priority: '',
  };
  const methods = useForm({
    resolver: yupResolver(agreementSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    handleSubmit,
  } = methods;

  const watchFields = watch(['name', 'priority']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      let err = false;
      if (quillFull === '') {
        setError('Template is required');
        err = true;
      }
      if (!err) {
        const apiData = {
          agreement_template_id: editValue?._id,
          name: data.name,
          priority: data.priority,
          body: quillFull,
          agreement_type: editValue?.agreement_type,
        };
        ApiCalling.apiCallPatch(`agreement_template`, apiData)
          .then((res) => {
            if (res.data) {
              setTimeout(() => {
                onEdit();
                setCustomLoading(false);
                onClose();
                ToasteMessage(res.data.message, 'success');
              }, 1000);
            } else {
              handleLoader(setCustomLoading, false, 500);
            }
          })
          .catch((e) => {
            handleLoader(setCustomLoading, false, 500);
            console.log('error', e);
          });
      }
    } catch (er) {
      handleLoader(setCustomLoading, false, 500);
      console.error(er);
      reset();
    }
  });

  useEffect(() => {
    const { priority, name } = getValues();
    setIsFormValid(!!priority && !!name);
  }, [watchFields, getValues]);

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Agreement Name"
        type="text"
        name="name"
        inputRef={firstFieldRef}
        disabled={
          hasPermission('agreementTemplate.view') && !hasPermission('agreementTemplate.update')
        }
      />
      <RHFTextField
        id="outlined-email"
        label="Priority"
        type="number"
        name="priority"
        disabled={
          hasPermission('agreementTemplate.view') && !hasPermission('agreementTemplate.update')
        }
      />
      <Editor
        id="full-editor"
        value={quillFull}
        onChange={(value) => setQuillFull(value)}
        height="350px"
        readOnly={
          hasPermission('agreementTemplate.view') && !hasPermission('agreementTemplate.update')
        }
      />

      {error && <FormHelperText error>{error}</FormHelperText>}
      <div className="text-center pb-3">
        {hasPermission('agreementTemplate.update') && (
          <LoadingButton
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            disabled={!isFormValid}
            loading={customLoading}
          >
            Save
          </LoadingButton>
        )}
      </div>
    </Stack>
  );
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setCustomLoading(false);
          setQuillFull('');
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        TransitionProps={{
          onEntered: () => {
            if (firstFieldRef.current) {
              firstFieldRef.current.focus();
            }

            if (editValue) {
              reset({
                name: editValue.name,
                priority: editValue.priority,
              });
              setQuillFull(editValue.body);
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontSize={16} fontWeight={600} className="d-flex align-items-center justify-space-between">
            Agreement Template{' '}
            <Button
              onClick={() => {
                onClose();
                setCustomLoading(false);
                setQuillFull('');
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="pt-3 pb-3">
            <Paper
              sx={{
                border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                padding: 2,
                mb: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    email:{' '}
                    <Typography component="span" variant="body2" fontWeight="bold">
                      {`{email}`}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    customer id:{' '}
                    <Typography component="span" variant="body2" fontWeight="bold">
                      {`{customer_id}`}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    customer name:{' '}
                    <Typography component="span" variant="body2" fontWeight="bold">
                      {`{customer_name}`}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    customer address:{' '}
                    <Typography component="span" variant="body2" fontWeight="bold">
                      {`{customer_address}`}
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
