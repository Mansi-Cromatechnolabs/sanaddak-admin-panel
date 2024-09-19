import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Grow,
  Dialog,
  Checkbox,
  Typography,
  DialogTitle,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFUpload } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

export default function GoldPieceUpload({ open, onClose, valuation_id, customer_id }) {
  const router = useRouter();
  const goldPieceSchema = Yup.object().shape({
    multiUpload: Yup.array().min(1, 'At least one file must be uploaded.'),
  });
  const defaultValues = {
    multiUpload: [],
    verifyWithApp: false,
    verifyWithOTP: false,
  };

  const methods = useForm({
    resolver: yupResolver(goldPieceSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
  } = methods;

  const values = watch();
  const onSubmit = handleSubmit(async (data) => {
    try {
      const apiData = {
        customer_id: '66ab60b80ad6c6c77f977ba7',
        valuation_id,
        item_name: [],
        specification: '',
        verification_type: data.verifyWithApp && 'mobile_verify',
      };
      ApiCalling.apiCallPost('loan', apiData)
        .then((res) => {
          if (res.data) {
            router.push(paths.agreement);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  });
  const handleToggle = (fieldName, value) => {
    setValue(fieldName, value, { shouldValidate: true });
    if (value) {
      setValue(fieldName === 'verifyWithApp' ? 'verifyWithOTP' : 'verifyWithApp', false, {
        shouldValidate: true,
      });
    }
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      const files = values.multiUpload || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('multiUpload', [...files, ...newFiles], {
        shouldValidate: true,
      });
    },
    [setValue, values.multiUpload]
  );
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h2">Upload Gold Piece Photos</Typography>
        </DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <RHFUpload
              isButtondisplay={false}
              multiple
              thumbnail
              name="multiUpload"
              maxSize={10485760}
              onDrop={handleDropMultiFile}
              onRemove={(inputFile) =>
                setValue(
                  'multiUpload',
                  values.multiUpload && values.multiUpload?.filter((file) => file !== inputFile),
                  { shouldValidate: true }
                )
              }
              onRemoveAll={() => setValue('multiUpload', [], { shouldValidate: true })}
              onUpload={() => console.info('ON UPLOAD', values)}
            />
            <Grid container marginTop={2}>
              <Grid item xs={12} sm={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.verifyWithApp}
                      onChange={(e) => handleToggle('verifyWithApp', e.target.checked)}
                    />
                  }
                  label="Verify using App"
                />
              </Grid>
            </Grid>

            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              variant="contained"
              sx={{ marginTop: 2, marginBottom: 2 }}
              disabled={values.multiUpload.length === 0 || !values.verifyWithApp}
              onClick={onSubmit}
            >
              Generate Aggreement
            </LoadingButton>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
