/* eslint-disable import/order */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import { Close } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import {
  Grid,
  Grow,
  Step,
  Dialog,
  Button,
  Stepper,
  StepLabel,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

// eslint-disable-next-line perfectionist/sort-imports
import { golden } from 'src/theme/palette';
import { setData } from 'src/redux/dataSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { ApplicationStatus } from 'src/ENUMS/enums';
import { setAgreementData } from 'src/redux/agreementSlice';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import LiquidityCard from 'src/components/sanaddak/Gold-Valuation/LiquidityCard';

import CustomerInventory from '../drawer/customerInventory';
import { handleapplicationStatus } from '../loan-calculator/LoanCalculatorView';

export default function AppliedLiquidity() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isStatusModel, setIsStatusModel] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [valuationList, setValuationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [valuationStatusList, setValuationStatusList] = useState([]);

  const applicationStatus = (status) => {
    switch (status) {
      case ApplicationStatus.APPLIED_FOR_LOAN:
        return { label: 'Applied for Loan', color: 'primary' };
      case ApplicationStatus.STORE_VISIT:
        return { label: 'Store Visit', color: 'secondary' };
      case ApplicationStatus.VALUATION_REJECT:
        return { label: 'Valuation Rejected', color: 'error' };
      case ApplicationStatus.VALUATION_CHECK:
        return { label: 'Valuation in Check', color: 'warning' };
      case ApplicationStatus.GENERATE_AGREEMENT:
        return { label: 'Agreement Generated', color: 'info' };
      case ApplicationStatus.APPROVED_BY_CUSTOMER:
        return { label: 'Approved by Customer', color: 'success' };
      case ApplicationStatus.REJECT_BY_CUSTOMER:
        return { label: 'Rejected by Customer', color: 'error' };
      case ApplicationStatus.READY_FOR_DISBURSMENT:
        return { label: 'Ready for Disbursement', color: 'success' };
      case ApplicationStatus.LOAN_PROCESS_COMPLETED:
        return { label: 'Loan Process Completed', color: 'success' };
      default:
        return { label: '', color: 'default' };
    }
  };

  const getValuation = () => {
    setLoading(true);
    ApiCalling.apiCallGet(`gold_loan/valuation_details?valuation_type=applied`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          // console.log('res.data', res.data);
          setValuationList(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
        }
      })
      .catch((err) => {
        console.log('error', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getValuation();
  }, []);

  return (
    <div>
      <Grid container spacing={1}>
        {loading ? (
          <Loader />
        ) : hasData ? (
          <>
            {valuationList?.map((v, i) => {
              return (
                <Grid item xs={6} sm={6} md={6} lg={4} key={i}>
                  <LiquidityCard
                    style={{ height: '100%' }}
                    isApply
                    liquidity_amt={v.available_liquidity_to_customer}
                    karat={v.gold_purity_entered_per_1000}
                    weight={v.gold_weight}
                    tenure={v.tenure}
                    valuation_Id={v.valuation_number}
                    installment={v.installment}
                    m_rate={v.margin_rate}
                    total_margin={v.total_margin}
                    l_status={v.current_status}
                    isButtonHide={
                      v.current_status === ApplicationStatus.READY_FOR_DISBURSMENT ||
                      v.current_status === ApplicationStatus.VALUATION_REJECT ||
                      v.current_status === ApplicationStatus.REJECT_BY_CUSTOMER ||
                      !hasPermission('liquidityApplicationProcess.liquidityApplicationProcess')
                    }
                    onApplyClick={() => {
                      switch (v.current_status) {
                        case null:
                        case ApplicationStatus.APPLIED_FOR_LOAN:
                          handleapplicationStatus(v.valuation_id, ApplicationStatus.STORE_VISIT);
                          router.push(paths.loanCalculator);
                          dispatch(setData(v));
                          break;

                        case ApplicationStatus.STORE_VISIT:
                        case ApplicationStatus.VALUATION_REJECT:
                        case ApplicationStatus.VALUATION_CHECK:
                          router.push(paths.loanCalculator);
                          dispatch(setData(v));
                          break;

                        case ApplicationStatus.GENERATE_AGREEMENT:
                        case ApplicationStatus.APPROVED_BY_CUSTOMER:
                        case ApplicationStatus.REJECT_BY_CUSTOMER:
                          dispatch(
                            setAgreementData({
                              agreements: v.agreements,
                              valuationId: v.valuation_id,
                              loan_id: v.liquidity_id,
                              liquidity_number: v.liquidate_number,
                              customerId: v.customer_id,
                            })
                          );
                          router.push(paths.agreement);
                          break;
                        default:
                          break;
                      }
                    }}
                    chipColor={applicationStatus(v.current_status)?.color}
                    chipLabel={applicationStatus(v.current_status)?.label}
                    onCardClick={() => {
                      setIsStatusModel(true);
                      setValuationStatusList(v.valuation_status);
                    }}
                  />
                </Grid>
              );
            })}
          </>
        ) : (
          <NoResultFound />
        )}
      </Grid>
      <CustomerInventory
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      />
      <Dialog
        open={isStatusModel}
        onClose={() => {
          setIsStatusModel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '60%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h2">Application Status</Typography>
            <Button
              onClick={() => {
                setIsStatusModel(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={-1} orientation="vertical" sx={{ mb: 3, color: golden.default }}>
            {valuationStatusList?.map((status, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {status.is_completed ? (
                        <CheckCircleIcon color={golden.default} />
                      ) : (
                        <CircleOutlinedIcon color="disabled" />
                      )}
                    </Box>
                  )}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="body1"
                      fontWeight={status.is_completed === 1 ? 'bold' : 'normal'}
                      color={status.is_completed === 1 ? 'golden.default' : 'inherit'}
                    >
                      {status.application_status}
                    </Typography>
                    {status.status_update_date && (
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        {globalUTCFormatDate(status.status_update_date)}
                      </Typography>
                    )}
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>
    </div>
  );
}
