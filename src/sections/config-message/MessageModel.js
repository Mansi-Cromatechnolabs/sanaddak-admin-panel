'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect } from 'react';
/* eslint-disable react/prop-types */

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Grid, Paper, Button, Typography, FormHelperText } from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Editor from 'src/components/editor/editor';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

export default function MessageModel({ open, onClose, editValue, onSave }) {
  const [quillFull, setQuillFull] = useState('');
  const [error, setError] = useState('');
  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);

  const TemplateSchema = Yup.object().shape({
    templateName: Yup.string().required('Template Name is required'),
  });

  const defaultValues = {
    templateName: '',
  };
  const methods = useForm({
    resolver: yupResolver(TemplateSchema),
    defaultValues,
  });

  const { reset, watch, getValues, handleSubmit } = methods;

  const watchFields = watch(['templateName']);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let err = false;
      if (quillFull === '') {
        setError('Template is required');
        err = true;
      }
      if (!err) {
        if (editValue) {
          await handleUpdate(data);
        } else {
          await handleAdd(data);
        }
      }
    } catch (e) {
      console.error(e);
      reset();
    }
  });

  useEffect(() => {
    const { templateName } = getValues();
    setIsFormValid(!!templateName);
  }, [watchFields, getValues]);

  const handleAdd = async (data) => {
    try {
      const apiData = {
        name: data.templateName,
        notification_type: 'sms',
        message: quillFull,
      };
      ApiCalling.apiCallPost(`notification_template`, apiData)
        .then((res) => {
          if (res.data) {
            onClose();
            onSave();
          }
        })
        .catch((e) => {
          console.log('error', e);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const apiData = {
        notification_template_id: editValue._id,
        name: data.templateName,
        notification_type: 'sms',
        message: quillFull,
      };
      ApiCalling.apiCallPatch(`notification_template`, apiData)
        .then((res) => {
          if (res.data) {
            onClose();
            onSave();
          }
        })
        .catch((e) => {
          console.log('error', e);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const renderForm = (
    <Stack spacing={1} mb={1}>
      <RHFTextField
        id="outlined-email"
        label="Template Name"
        type="text"
        name="templateName"
        inputRef={firstFieldRef}
        disabled={hasPermission('messageTemplate.view') && !hasPermission('messageTemplate.update')}
      />
    </Stack>
  );
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset({
            templateName: '',
          });
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
                templateName: editValue.name,
              });
              setQuillFull(editValue.message);
            } else {
              reset({
                templateName: '',
              });
              setQuillFull('');
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h2" className="d-flex align-items-center justify-space-between">
            Message Template{' '}
            <Button
              onClick={() => {
                onClose();
                reset({
                  templateName: '',
                });
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
              <Editor
                id="full-editor"
                value={quillFull}
                onChange={(value) => setQuillFull(value)}
                height="300px"
                readOnly={
                  hasPermission('messageTemplate.view') && !hasPermission('messageTemplate.update')
                }
              />

              {error && <FormHelperText error>{error}</FormHelperText>}
              <div className="text-end pt-3">
                {hasPermission('messageTemplate.update') && (
                  <LoadingButton
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="contained"
                    onClick={() => {
                    }}
                    disabled={!isFormValid}
                  >
                    Save
                  </LoadingButton>
                )}
              </div>
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
