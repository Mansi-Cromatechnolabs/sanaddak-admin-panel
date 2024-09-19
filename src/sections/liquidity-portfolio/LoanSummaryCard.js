/* eslint-disable react/prop-types */

'use client';

import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import {
  Box,
  Grid,
  Grow,
  Chip,
  Paper,
  Avatar,
  Dialog,
  Button,
  CardHeader,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { setAgreementData } from 'src/redux/agreementSlice';
import { LoanStatus, AgreementType, AppointmentStatus } from 'src/ENUMS/enums';

import LiquidityCard from 'src/components/sanaddak/Gold-Valuation/LiquidityCard';

import ExtendIcon from '../../../public/assets/images/loan/extend-icon.svg';
import BuyBackIcon from '../../../public/assets/images/loan/buyback-icon.svg';
import LiquidateIcon from '../../../public/assets/images/loan/liquidate-icon.svg';
import ViewContractIcon from '../../../public/assets/images/loan/view-contract-icon.svg';

const Extend = dynamic(() => import('../drawer/Extend'), {
  ssr: false,
});
const Buyback = dynamic(() => import('../drawer/buyback'), {
  ssr: false,
});
const Liquidate = dynamic(() => import('../drawer/Liquidate'), {
  ssr: false,
});

export default function LoanSummaryCard({ data, appointmentType }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const router = useRouter();
  const dispatch = useDispatch();
  const [buyBackDrawerOpen, setBuyBackDrawerOpen] = useState(false);
  const [extendDrawerOpen, setExtendDrawerOpen] = useState(false);
  const [LiquidateDrawerOpen, setLiquidateDrawerOpen] = useState(false);
  const [alertModel, setAlertModel] = useState({ isOpen: false, type: '' });
  const [isExtendProceed, setIsExtendProceed] = useState(false);
  const [isAgreementView, setIsAgreementView] = useState(false);
  const [viewAgreementList, setViewAgreementList] = useState([]);
  const [isHideButtons, setIsHideButtons] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    if (appointmentType) {
      if (appointmentType === AppointmentStatus.BUYBACK) {
        setBuyBackDrawerOpen(true);
      } else if (appointmentType === AppointmentStatus.EXTEND) {
        setBuyBackDrawerOpen(true);
      } else if (appointmentType === AppointmentStatus.LIQUIDATE) {
        setLiquidateDrawerOpen(true);
      } else {
        setBuyBackDrawerOpen(false);
        setBuyBackDrawerOpen(false);
        setLiquidateDrawerOpen(false);
      }
    }
  }, [appointmentType]);

  const handleBuyBackDrawerOpen = () => {
    setBuyBackDrawerOpen(true);
  };

  const handleBuyBackDrawerClose = () => {
    setBuyBackDrawerOpen(false);
  };
  const handleExtendDrawerOpen = () => {
    setExtendDrawerOpen(true);
  };

  const handleExtendDrawerClose = () => {
    setExtendDrawerOpen(false);
  };

  const handleLiquidateDrawerOpen = () => {
    setLiquidateDrawerOpen(true);
  };

  const handleLiquidateDrawerClose = () => {
    setLiquidateDrawerOpen(false);
  };
  const SubheaderWithAdditional = () => (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {data?.customer?.phone}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {data?.customer?.email}
      </Typography>
    </Box>
  );
  const TitleWithAdditional = () => (
    <Box>
      <Typography variant="h6">{data?.customer?.full_name}</Typography>
    </Box>
  );
  const handleViewContract = () => {
    setViewAgreementList(data?.agreements);
    setIsAgreementView(true);
  };

  const handleBuybackProceed = () => {
    setAlertModel({ isOpen: true, type: 'Buyback' });
  };
  const handleBuyback = () => {
    const apiData = {
      loan_id: data.liquidity_id,
      loan_closer_type: AgreementType.FULLFILLMENT,
    };
    ApiCalling.apiCallPost('loan/loan_closer', apiData)
      .then((res) => {
        if (res.data) {
          setAlertModel({ isOpen: false, type: '' });
          dispatch(
            setAgreementData({
              agreements: res.data.data.agreements,
              valuationId: null,
              loan_id: data.liquidity_id,
              liquidity_number: res.data.data.liquidity_number,
              customerId: data?.customer?.id,
            })
          );
          router.push(paths.agreement);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleExtendProceed = () => {
    setAlertModel({ isOpen: true, type: 'Extend' });
  };

  const handleLiquidateProceed = () => {
    setAlertModel({ isOpen: true, type: 'Liquidate' });
  };

  const handleLiquidate = () => {
    const apiData = {
      loan_id: data.liquidity_id,
      loan_closer_type: AgreementType.LIQUIDATE,
    };
    ApiCalling.apiCallPost('loan/loan_closer', apiData)
      .then((res) => {
        if (res.data) {
          setAlertModel({ isOpen: false, type: '' });
          dispatch(
            setAgreementData({
              agreements: res.data.data.agreements,
              valuationId: null,
              loan_id: data.liquidity_id,
              liquidity_number: res.data.data.liquidity_number,
              customerId: data?.customer?.id,
            })
          );
          router.push(paths.agreement);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (data) {
      if (data?.liquidity_status !== LoanStatus.ACTIVE) setIsHideButtons(true);
    } else {
      setIsHideButtons(false);
    }
  }, [data]);

  const liquidityStatus = (status) => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return { label: 'ACTIVE', color: 'primary' };
      case LoanStatus.INACTIVE:
        return { label: 'INACTIVE', color: 'info' };
      case LoanStatus.BUYBACK:
        return { label: 'BUYBACK COMPLETED', color: 'success' };
      case LoanStatus.EXTEND:
        return { label: 'EXTEND', color: 'secondary' };
      case LoanStatus.LIQUIDATE:
        return { label: 'LIQUIDATE', color: 'warning' };
      case LoanStatus.OVERDUE:
        return { label: 'OVERDUE', color: 'error' };

      default:
        return { label: '', color: 'default' };
    }
  };
  return (
    <div>
      <Box sx={{ textAlign: 'right' }}>
        <Chip
          variant="soft"
          label={liquidityStatus(data?.liquidity_status)?.label}
          color={liquidityStatus(data?.liquidity_status)?.color}
        />
      </Box>
      <Card
        sx={{
          mt: 1,
          mb: 3,
          cursor: 'pointer',
          boxShadow: 'none',
          border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={
                data?.customer?.profile_image
                  ? `${s3URL}/${data?.customer?.id}/${data?.customer?.profile_image}`
                  : ''
              }
              alt={data?.customer?.full_name}
              aria-label="recipe"
              sx={{ width: 56, height: 56 }}
            />
          }
          title={<TitleWithAdditional />}
          subheader={<SubheaderWithAdditional />}
          titleTypographyProps={{
            sx: {
              fontSize: '1rem',
            },
          }}
          subheaderTypographyProps={{
            sx: {
              marginTop: 0,
            },
          }}
          sx={{
            marginBottom: 2,
          }}
        />
      </Card>

      <LiquidityCard
        liquidity_amt={data?.available_liquidity_to_customer}
        l_id={data?.liquidate_number}
        installment={data?.installments[0]?.emi_amount}
        m_rate={data?.margin_rate}
        tenure={data?.tenure_in_months}
        total_margin={data?.total_margin}
        karat={data?.gold_karatage}
        weight={data?.gold_weight}
        upcoming_installment_date={data?.upcoming_installment_date}
      />
      {(data?.parent_liquidity_id || data?.liquidity_status === LoanStatus.LIQUIDATE) && (
        <Card
          sx={{
            mt: 3,
            cursor: 'pointer',
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              {data?.parent_liquidity_id && (
                <>
                  <Grid item xs={8}>
                    <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                      Balance to paid by customer
                    </Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="end">
                    <Typography variant="h3" fontWeight={600}>
                      {data?.balance_to_paid_by_customer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                      Topup Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="end">
                    <Typography variant="h3" fontWeight={600}>
                      {data?.top_up}
                    </Typography>
                  </Grid>
                </>
              )}
              {data?.liquidity_status === LoanStatus.LIQUIDATE && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                      Expected Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="end">
                    <Typography variant="h3" fontWeight={600}>
                      {data?.total_liquidation_amount}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                      Recieved From Customer
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="end">
                    <Typography variant="h3" fontWeight={600}>
                      {data?.customer_total_paid_amount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                      Paid To customer
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="end">
                    <Typography variant="h3" fontWeight={600}>
                      St-15000
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      <Card
        sx={{
          mt: 3,
          cursor: 'pointer',
          boxShadow: 'none',
          border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
        }}
      >
        <CardContent>
          {!isHideButtons && (
            <>
              {hasPermission('liquidityApplicationProcess.liquidityApplicationProcess') && (
                <Paper
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light' ? 'rgba(245, 245, 245, 1)' : '',
                    border: (theme) => (theme.palette.mode === 'dark' ? '1px solid #959797' : ''),
                    padding: 2,
                    marginBottom: 2,
                  }}
                >
                  <Grid container textAlign="center">
                    <Grid
                      item
                      xs={4}
                      sx={{
                        borderRight: (theme) => `1px solid ${theme.palette.text.gray500}`,
                      }}
                      onClick={handleBuyBackDrawerOpen}
                    >
                      <BuyBackIcon />
                      <Typography>Buyback</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sx={{
                        borderRight: (theme) => `1px solid ${theme.palette.text.gray500}`,
                      }}
                      onClick={handleExtendDrawerOpen}
                    >
                      <ExtendIcon />
                      <Typography>Extend</Typography>
                    </Grid>
                    <Grid item xs={4} onClick={handleLiquidateDrawerOpen}>
                      <LiquidateIcon />
                      <Typography>Liquidate</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </>
          )}
          <Paper
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? 'rgba(245, 245, 245, 1)' : '',
              border: (theme) => (theme.palette.mode === 'dark' ? '1px solid #959797' : ''),
            }}
          >
            <Box p={2} textAlign="center" className="cursor-pointer" onClick={handleViewContract}>
              <ViewContractIcon /> View Agreements
            </Box>
          </Paper>
        </CardContent>
      </Card>
      <Buyback
        open={buyBackDrawerOpen}
        onClose={handleBuyBackDrawerClose}
        data={data}
        onBuybackClick={handleBuybackProceed}
      />
      <Extend
        open={extendDrawerOpen}
        onClose={handleExtendDrawerClose}
        liquidity_id={data?.liquidity_id}
        customer_id={data?.customer?.id}
        onExtendClick={handleExtendProceed}
        isConfirm={isExtendProceed}
      />
      <Liquidate
        open={LiquidateDrawerOpen}
        onClose={handleLiquidateDrawerClose}
        data={data}
        onLiquidateClick={handleLiquidateProceed}
      />

      <Dialog
        open={alertModel.isOpen}
        onClose={() => {
          setAlertModel({ isOpen: false, type: '' });
          setCustomLoading(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { maxWidth: 'none' } }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            Confirm ?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3" mb={3}>
            Are you sure you want to{' '}
            <Typography variant="span" fontWeight="bold">
              {alertModel.type}
            </Typography>{' '}
            this Liquidity?
          </Typography>
          <Box display="flex" justifyContent="end" alignItems="center" gap="3" paddingBottom={2}>
            <Button
              variant="text"
              onClick={() => {
                setAlertModel({ isOpen: false, type: '' });
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="soft"
              loading={customLoading}
              onClick={() => {
                setCustomLoading(true);
                if (alertModel.type === 'Buyback') {
                  handleBuyback();
                } else if (alertModel.type === 'Extend') {
                  setIsExtendProceed(true);
                  setAlertModel({ isOpen: false, type: '' });
                } else if (alertModel.type === 'Liquidate') {
                  handleLiquidate();
                }
              }}
            >
              Confirm
            </LoadingButton>
          </Box>
        </DialogContent>
      </Dialog>
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
          <Typography
            fontWeight={600}
            fontSize={16}
            mb={2}
            className="d-flex align-items-center justify-space-between"
          >
            View Agreements
            <Button
              onClick={() => {
                setIsAgreementView(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
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
                        `${s3URL}/${data?.customer?.id}/${data?.liquidate_number}/${agreement.agreement_url}`,
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
    </div>
  );
}
