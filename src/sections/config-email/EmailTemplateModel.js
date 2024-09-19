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
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

export default function EmailTemplateModel({ open, onClose, editValue, onSave }) {
  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);

  const [quillFull, setQuillFull] = useState('');
  const [error, setError] = useState('');

  const TemplateSchema = Yup.object().shape({
    templateName: Yup.string().required('Template Name is required'),
    subject: Yup.string().required('Subject is required'),
    fromEmail: Yup.string()
      .required('Email is required')
      .test('is-valid', 'Email or phone number must be valid', (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
      }),
  });

  const defaultValues = {
    templateName: '',
    fromEmail: '',
    subject: '',
    cc: '',
    bcc: '',
  };
  const methods = useForm({
    resolver: yupResolver(TemplateSchema),
    defaultValues,
  });

  const { reset, watch, getValues, handleSubmit } = methods;

  const watchFields = watch(['templateName', 'fromEmail', 'subject']);

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.cc =
        typeof data.cc === 'string' && data.cc.trim() !== ''
          ? data.cc.split(',').map((email) => email.trim())
          : [];

      data.bcc =
        typeof data.bcc === 'string' && data.bcc.trim() !== ''
          ? data.bcc.split(',').map((email) => email.trim())
          : [];
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

  const handleAdd = async (data) => {
    try {
      const apiData = {
        name: data.templateName,
        body: quillFull,
        from: data.fromEmail,
        subject: data.subject,
        cc: data.cc,
        bcc: data.bcc,
      };
      ApiCalling.apiCallPost(`email_template`, apiData)
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
        email_template_id: editValue._id,
        name: data.templateName,
        body: quillFull,
        from: data.fromEmail,
        subject: data.subject,
        cc: data.cc,
        bcc: data.bcc,
      };
      ApiCalling.apiCallPatch(`email_template`, apiData)
        .then((res) => {
          if (res.data) {
            onClose();
            onSave();
            ToasteMessage(res.data.message, 'success');
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
    <Stack spacing={2} mb={1}>
      <RHFTextField
        id="outlined-email"
        label="Template Name"
        type="text"
        name="templateName"
        inputRef={firstFieldRef}
        disabled={hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')}
      />

      <RHFTextField
        id="outlined-email"
        label="Email"
        type="text"
        name="fromEmail"
        disabled={hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')}
      />
      <RHFTextField
        id="outlined-email"
        label="Subject"
        type="text"
        name="subject"
        disabled={hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')}
      />
      <Grid container spacing={1}>
        <Grid item md={6}>
          <RHFTextField
            id="outlined-email-cc"
            label="CC"
            type="text"
            name="cc"
            placeholder="Enter emails separated by commas"
            disabled={hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')}
          />
        </Grid>

        <Grid item md={6}>
          <RHFTextField
            id="outlined-email-bcc"
            label="BCC"
            type="text"
            name="bcc"
            placeholder="Enter emails separated by commas"
            disabled={hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')}
          />
        </Grid>
      </Grid>
    </Stack>
  );

  useEffect(() => {
    const { templateName, fromEmail, subject, cc, bcc } = getValues();
    setIsFormValid(!!templateName && !!fromEmail && !!subject && !!cc && !!bcc);
  }, [watchFields, getValues]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset({
            templateName: '',
            fromEmail: '',
            subject: '',
            cc: '',
            bcc: '',
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
                fromEmail: editValue.from,
                subject: editValue.subject,
                cc: editValue.cc,
                bcc: editValue.bcc,
              });
              setQuillFull(editValue.body);
            } else {
              reset({
                templateName: '',
                fromEmail: '',
                subject: '',
                cc: '',
                bcc: '',
              });
              setQuillFull('');
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontSize={16} fontWeight={600} className="d-flex align-items-center justify-space-between">
            Email Template{' '}
            <Button
              onClick={() => {
                onClose();
                reset({
                  templateName: '',
                  fromEmail: '',
                  subject: '',
                  cc: '',
                  bcc: '',
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
                sx={{ mt: 3 }}
                id="full-editor"
                value={quillFull}
                onChange={(value) => setQuillFull(value)}
                readOnly={
                  hasPermission('emailTemplate.view') && !hasPermission('emailTemplate.update')
                }
              />

              {error && <FormHelperText error>{error}</FormHelperText>}
              <div className="text-center pt-3 pb-3">
                {hasPermission('emailTemplate.update') && (
                  <LoadingButton
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={!isFormValid}
                    onClick={() => {
                    }}
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
