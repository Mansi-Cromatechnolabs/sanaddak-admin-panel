/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Grow,
  Button,
  Dialog,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { ApplicationStatus } from 'src/ENUMS/enums';

import FileUpload from './FileUpload';
import LiquiditySucessModel from './LiquiditySucessModel';
import { handleapplicationStatus } from '../loan-calculator/LoanCalculatorView';

export default function SignedMurabahaAgreement({ valuationId, data }) {
  const [isModelOpen, setIsModelOpen] = useState(false);

  const [isConfirmModel, setIsConfirmModel] = useState(false);
  const [errors, setErrors] = useState({});
  const [customLoading, setCustomLoading] = useState(false);

  const [fileUploads, setFileUploads] = useState(
    data.reduce((acc, agreement) => {
      acc[agreement.name] = null;
      return acc;
    }, {})
  );

  const validate = () => {
    const tempErrors = {};

    data.forEach((agreement) => {
      if (!fileUploads[agreement.name]) {
        tempErrors[agreement.name] = `${agreement.name} is required`;
      }
    });
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const onSubmit = (event) => {
    event.preventDefault();

    if (validate()) {
      setIsConfirmModel(true);
    } else {
      console.error('Validation failed');
    }
  };
  const handleFileChange = (name, file) => {
    setFileUploads((prev) => ({ ...prev, [name]: file }));
  };
  const handleLoanDisburse = () => {
    setCustomLoading(true);
    setTimeout(() => {
      setIsModelOpen(true);
      handleapplicationStatus(valuationId, ApplicationStatus.READY_FOR_DISBURSMENT);
      setCustomLoading(false);
    }, 1000);
  };

  return (
    <div>
      <Card>
        <Typography variant="h2" textAlign="center" mt={2}>
          Upload customer's signed agreement
        </Typography>
        <CardContent>
          <Box sx={{ mt: 2 }}>
            {data.map((agreement) => (
              <FileUpload
                key={agreement._id}
                value={fileUploads[agreement.name]}
                onChange={(file) => handleFileChange(agreement.name, file)}
                label={`Upload ${agreement.name}`}
                error={errors[agreement.name]}
              />
            ))}

            <Button
              sx={{ mt: 2 }}
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              onClick={onSubmit}
            >
              Confirm
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Dialog
        open={isConfirmModel}
        onClose={() => {
          setCustomLoading(false);
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
          <Typography variant="h2">Confirm</Typography>
        </DialogTitle>
        <DialogContent>
          <div className=" pb-3">Are you sure you want to Proceed?</div>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsConfirmModel(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="soft"
              color="error"
              loading={customLoading}
              onClick={handleLoanDisburse}
            >
              Confirm
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
      <LiquiditySucessModel
        open={isModelOpen}
        onClose={() => {
          setIsModelOpen(false);
        }}
      />
    </div>
  );
}
