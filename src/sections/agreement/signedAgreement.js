/* eslint-disable no-nested-ternary */
/* eslint-disable no-continue */
/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
import AWS from 'aws-sdk';
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';

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

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { AgreementType, ApplicationStatus } from 'src/ENUMS/enums';

import FileUpload from './FileUpload';
import LiquiditySucessModel from './LiquiditySucessModel';

export default function SignedAgreement({
  valuationId,
  data,
  loanId,
  customerId,
  liquidityNumber,
}) {
  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY;
  const secretAccessKey = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY;
  const region = process.env.NEXT_PUBLIC_REGION;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [customerApproval, setCustomerApproval] = useState(null);
  const [isConfirmModel, setIsConfirmModel] = useState(false);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const [fileUploads, setFileUploads] = useState(
    data?.reduce((acc, agreement) => {
      acc[agreement.name] = null;
      return acc;
    }, {})
  );

  const areAllFilesUploaded = () => !Object.values(fileUploads).includes(null);

  const getCustomerApproval = () => {
    ApiCalling.apiCallGet(`appointment/application_status?loan_id=${loanId}`)
      .then((res) => {
        if (res.data) {
          setCustomerApproval(res.data.data);
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  useEffect(() => {
    getCustomerApproval();
  }, []);

  const validate = () => {
    const tempErrors = {};

    data?.forEach((agreement) => {
      if (!fileUploads[agreement.name]) {
        tempErrors[agreement.name] = `${agreement.name} is required`;
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleUpload = (event) => {
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
  const handleUploadAgreement = async () => {
    setCustomLoading(true);
    const uploadedFiles = [];

    await handleDocumentUpload(uploadedFiles);
    const signedAgreements = uploadedFiles.map(({ agreementType, url }) => ({
      agreement_type: agreementType,
      agreement_url: url,
    }));

    const apiData = {
      loan_id: loanId,
    };

    if (data?.length > 0) {
      let keyName = '';
      const agreementType = data[0].agreement_type;
      switch (agreementType) {
        case AgreementType.MURABAHA:
          keyName = 'signed_agreements';
          break;
        case AgreementType.FULLFILLMENT:
          keyName = 'signed_fullfillment_agreement';
          break;
        case AgreementType.LIQUIDATE:
          keyName = 'signed_liquidate_agreement';
          break;
        default:
          keyName = '';
      }

      if (keyName !== '') {
        if (keyName === 'signed_agreements') {
          apiData[keyName] = signedAgreements;
        } else {
          apiData[keyName] = signedAgreements[0];
        }
      }
    }

    ApiCalling.apiCallPatch('loan', apiData)
      .then((res) => {
        if (res.data) {
          setSuccessData(res.data.data);
          setTimeout(() => {
            setIsModelOpen(true);
            setCustomLoading(false);
          }, 1000);
        } else {
          handleLoader(setCustomLoading, false, 500);
        }
      })
      .catch((error) => {
        console.error(error);
        handleLoader(setCustomLoading, false, 500);
      });
  };

  const handleDocumentUpload = async (uploadedFiles) => {
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();

    try {
      for (const [agreementType, file] of Object.entries(fileUploads)) {
        if (!file) continue;

        const extension = file.name.split('.').pop();
        const fileName = `${customerId}/${liquidityNumber}/${agreementType}.${extension}`;

        const params = {
          Bucket: bucket,
          Key: fileName,
          Expires: 60,
          ContentType: file.type,
          ACL: 'public-read',
        };

        const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (response.ok) {
          const file = `${agreementType}.${extension}`;
          uploadedFiles.push({ agreementType, url: file });
        } else {
          console.error(`Failed to upload ${agreementType}:`, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
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
            {data?.map((agreement) => (
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
              onClick={handleUpload}
              disabled={
                (data[0]?.agreement_type === AgreementType.MURABAHA &&
                  !(
                    customerApproval?.application_status === ApplicationStatus.APPROVED_BY_CUSTOMER
                  )) ||
                !areAllFilesUploaded()
              }
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
              onClick={handleUploadAgreement}
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
          setIsConfirmModel(false);
        }}
        data={successData}
        title={
          data[0]?.agreement_type === AgreementType.MURABAHA
            ? 'Ready For Disbursement'
            : data[0]?.agreement_type === AgreementType.FULLFILLMENT
              ? 'Buyback Completed'
              : data[0]?.agreement_type === AgreementType.LIQUIDATE
                ? 'Liquidate Successfully'
                : ''
        }
      />
    </div>
  );
}
