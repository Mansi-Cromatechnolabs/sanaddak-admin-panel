/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';

import { Box } from '@mui/system';
import { Card, Button, Typography, CardContent } from '@mui/material';

import FileUpload from './FileUpload';
import LiquiditySucessModel from './LiquiditySucessModel';

export default function SignedFullfillmentAgreement() {
  const [isModelOpen, setIsModelOpen] = useState(false);

  const [fullfillmentAgreement, setFullFillmentAgreement] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};

    if (!fullfillmentAgreement) {
      tempErrors.fullfillmentAgreement = 'Fullfillment Agreement is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const onSubmit = (event) => {
    event.preventDefault();

    if (validate()) {
      setIsModelOpen(true);
    } else {
      console.error('Validation failed');
    }
  };

  return (
    <div>
      <Card>
        <Typography variant="h2" textAlign="center" mt={2}>
          Upload customer's signed agreement
        </Typography>
        <CardContent>
          <Box sx={{ mt: 2 }}>
            <FileUpload
              value={fullfillmentAgreement}
              onChange={setFullFillmentAgreement}
              label="Upload Fullfillment Agreement"
              error={errors.fullfillmentAgreement}
            />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" onClick={onSubmit}>
                Submit
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <LiquiditySucessModel
        open={isModelOpen}
        onClose={() => {
          setIsModelOpen(false);
        }}
      />
    </div>
  );
}
