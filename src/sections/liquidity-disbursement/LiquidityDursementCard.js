/* eslint-disable react/prop-types */

'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import PreviewIcon from '@mui/icons-material/Preview';
import DialogContent from '@mui/material/DialogContent';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {
  Card,
  Grid,
  Grow,
  Avatar,
  Button,
  Tooltip,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import ApprovedSuceessModel from './ApprovedSucessModel';
import CustomerValuation from '../drawer/customerValuation';

export default function LiquidityDursementCard({ data, customerId, onApprove }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  // console.log('data:::', data);
  const paymobClientId = process.env.NEXT_PUBLIC_PAYMOB_CLIENT_ID;
  const paymobClientSecretKey = process.env.NEXT_PUBLIC_PAYMOB_CLIENT_SECRET_KEY;
  const paymobUsername = process.env.NEXT_PUBLIC_PAYMOB_USERNAME;
  const paymobPassword = process.env.NEXT_PUBLIC_PAYMOB_PASSWORD;
  const generateTokenAPIURL = process.env.NEXT_PUBLIC_GENERATE_TOKEN_API;
  const disbursementAPIURL = process.env.NEXT_PUBLIC_DISBURSEMENT_API;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApproveDrawer, setIsApproveDrawer] = useState(false);
  const [isAgreementView, setIsAgreementView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewAgreementList, setViewAgreementList] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [isSucessModel, setIsSucessModel] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const amount = data?.transfer_amount?.replace(/[^\d.-]/g, '');

  const liquidityDisbursementProcess = async () => {
    setCustomLoading(true);
    setIsSubmit(true);
    setTimeout(() => {
      setCustomLoading(false);
    }, 2000);
    if (amount > 0) {
      await generateToken();
    } else {
      paymentTransaction();
    }
    // paymentTransaction();
  };
  const generateToken = async () => {
    const reqData = {
      client_id: paymobClientId,
      client_secret: paymobClientSecretKey,
      username: paymobUsername,
      password: paymobPassword,
      grant_type: 'password',
    };
    try {
      const response = await axios({
        url: generateTokenAPIURL,
        method: 'POST',
        data: reqData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('before Token generated successfully', response.data);

      if (response.data) {
        console.log('Token generated successfully', response.data);
        await cashIn(); // Wait for cashIn to complete before proceeding
      }
    } catch (error) {
      console.error('Error generating token:', error);
      throw error; // Re-throw the error to be caught by the parent function
    }
  };

  const cashIn = () => {
    const reqData = {
      issuer: 'vodafone',
      amount: '1.0', // amount
      msisdn: data?.customer?.phone, // data?.customer?.phone
    };
    const token = localStorageGet('loginData')?.token;

    axios({
      url: disbursementAPIURL,
      method: 'POST',
      data: reqData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log('cashIn successfully', res.data);
        const response = res.data.data;
        setTransactionDetails(response);
      })
      .catch((error) => {
        console.log('error', error);
      });
  };
  const paymentTransaction = () => {
    const apiData = {
      customer_id: customerId,
      loan_id: data?._id,
      transaction_status: transactionDetails?.disbursement_status || 'success',
      transaction_id: transactionDetails?.transaction_id || '#tr214627hghg',
      transaction_method: transactionDetails?.issuer || '',
      transaction_details: transactionDetails?.aman_cashing_details || '',
      transaction_amount: amount || '0.00',
      transaction_fees: transactionDetails?.fees || '0.00',
      transaction_vat: transactionDetails?.vat || '0.00',
      number: data?.customer?.phone,
      description: transactionDetails?.status_description || 'Disbursed Liquidity',
      payment_status: 'credited',
    };
    console.log('apiData', apiData);
    ApiCalling.apiCallPost('loan_payment_transaction', apiData)
      .then((resp) => {
        if (resp.data) {
          setCustomLoading(false);
          setIsApproveDrawer(false);

          setSuccessData(resp.data.data);
          setIsSucessModel(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (transactionDetails) {
      paymentTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDetails]);

  const handleViewAgreementList = () => {
    setViewAgreementList(data?.signed_agreements);
    setIsAgreementView(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Grid container spacing={0.5} flexWrap="nowrap" justifyContent="space-between">
            <Grid item>
              <Grid container flexWrap="nowrap" spacing={2}>
                <Grid item>
                  <Avatar
                    src={
                      data?.customer?.profile_image
                        ? `${s3URL}/${data?.customer?._id}/${data?.customer?.profile_image}`
                        : ''
                    }
                    alt={data?.customer?.full_name}
                    aria-label="Customer Avatar"
                    sx={{ width: 35, height: 35 }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h3">{data?.liquidity_number}</Typography>
                  <Typography variant="h6" color="textSecondary">
                    {data?.customer?.full_name}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {data?.transfer_amount}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              textAlign={{ xs: 'center', md: 'right' }}
              display="flex"
              alignItems="start"
              mt={-1}
            >
              <Tooltip title="View Detail">
                <IconButton
                  onClick={() => {
                    setIsDrawerOpen(true);
                    setViewData(data);
                  }}
                >
                  <PreviewIcon sx={{ color: (theme) => theme.palette.text.secondary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Agreement">
                <IconButton onClick={handleViewAgreementList}>
                  <ViewTimelineIcon sx={{ color: (theme) => theme.palette.text.secondary }} />
                </IconButton>
              </Tooltip>
              {(hasPermission('transactionProcessingSystem.Below25kApprove') ||
                hasPermission('transactionProcessingSystem.Above25kApprove')) && (
                <Tooltip title="Approve">
                  <IconButton
                    onClick={() => {
                      setIsApproveDrawer(true);
                    }}
                  >
                    <AssignmentTurnedInIcon sx={{ color: (theme) => theme.palette.text.primary }} />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CustomerValuation
        drawerOpen={isDrawerOpen}
        handleDrawerClose={() => {
          setIsDrawerOpen(false);
        }}
        data={viewData}
        onConfirmClick={() => {
          setIsDrawerOpen(false);
          setIsApproveDrawer(true);
        }}
      />
      <Dialog
        open={isAgreementView}
        onClose={() => {
          setIsAgreementView(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Box className="d-flex align-items-center justify-space-between">
            <Typography variant="h2">View Agreements</Typography>
            <Button
              onClick={() => {
                setIsAgreementView(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {viewAgreementList?.map((agreement, i) => (
              <Grid container item key={i} alignItems="center" spacing={2}>
                <Grid item xs={10}>
                  <Typography variant="body1">{agreement.agreement_type}</Typography>
                </Grid>

                <Grid item xs={2}>
                  <Button
                    variant="soft"
                    onClick={() =>
                      window.open(
                        `${s3URL}/${data?.customer?._id}/${data?.liquidity_number}/${agreement.agreement_url}`,
                        '_blank'
                      )
                    }
                  >
                    View
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isApproveDrawer}
        onClose={() => {
          setIsApproveDrawer(false);
          setCustomLoading(false);
          setIsSubmit(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            Disbursement Approval
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className=" pb-3">
            <Typography variant="h3" color="textSecondary">
              Are you sure you want to proceed with approval ?
            </Typography>
            <Typography variant="h4" color="textSecondary" mt={1}>
              (Note: Once approved, the disbursement process will be initiate.)
            </Typography>
          </div>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsApproveDrawer(false);
                setIsSubmit(false);
                setCustomLoading(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={isSubmit || customLoading}
              variant="soft"
              onClick={() => {
                liquidityDisbursementProcess();
              }}
            >
              Approve
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
      <ApprovedSuceessModel
        onClose={() => {
          setIsSucessModel(false);
          setCustomLoading(false);
          onApprove();
        }}
        open={isSucessModel}
        data={successData}
      />
    </>
  );
}
