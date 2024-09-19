/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable radix */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-cycle */
/* eslint-disable no-empty */

'use client';

import * as Yup from 'yup';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import { Stack } from '@mui/system';
import Card from '@mui/material/Card';
import { LoadingButton } from '@mui/lab';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import SearchIcon from '@mui/icons-material/Search';
import {
  Grow,
  Paper,
  Select,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  CardContent,
  DialogTitle,
  ListItemText,
  ListSubheader,
  DialogContent,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';
import { appendDecimal } from 'src/utils/appendDecimalUtils';

import { clearData } from 'src/redux/dataSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { ApplicationStatus } from 'src/ENUMS/enums';
import { clearLoanData } from 'src/redux/loanDataSlice';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import { RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import CustomerInventory from '../drawer/customerInventory';

export const handleapplicationStatus = (v_id, status) => {
  const apiData = {
    valuation_id: v_id,
    application_status: status,
  };
  ApiCalling.apiCallPatch('appointment/application_status', apiData).then((res) => {
    if (res.data) {
    }
  });
};

export default function LoanCalculatorView() {
  const settings = useSettingsContext();
  const dispatch = useDispatch();
  const getLoanData = useSelector((state) => state.loanData.loanDetails);

  const getValuationData = useSelector((state) => state?.getData?.data);

  const [isLoanCalculate, setIsLoanCalculate] = useState(false);
  const [tenureList, setTenureList] = useState([]);
  const [getValuation, setGoldValuation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [valuationDetails, setValuationDetails] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmModel, setIsConfirmModel] = useState(false);
  const [isRejectModel, setIsRejectModel] = useState(false);
  const [valuationId, setValuationId] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customCalculateLoading, setCustomCalculateLoading] = useState(false);

  const firstFieldRef = useFocusOnMount();

  const [isFormValid, setIsFormValid] = useState(false);

  const CalculateSchema = Yup.object().shape({
    loanAmount: Yup.string()
      .required('Loan Amount is required')
      .transform((value) => {
        if (!value) return value;
        return value.replace(/,/g, '');
      })
      .test('is-number', 'Loan Amount must be a number', (value) => !isNaN(value))
      .test(
        'is-positive',
        'Loan Amount is required & must be positive',
        (value) => parseFloat(value) > 0
      ),

    weight: Yup.number()
      .typeError('Weight must be a number')
      .required('Weight is required')
      .positive('Weight is required & must be positive')
      .test('weight-format', 'Weight must have at most 3 decimal places', (value) => {
        if (value == null) {
          return true;
        }
        const regex = /^\d+(\.\d{0,3})?$/;
        return regex.test(value);
      }),
    caratage: Yup.number()
      .typeError('Karat must be a number')
      .required('Karat is required')
      .positive('Karat is required & must be positive')
      .max(24, 'Karat cannot be more than 24'),
    tenure: Yup.string().required('Tenure is required'),
  });

  const defaultValues = {
    loanAmount: '',
    isStone: false,
    weight: '',
    caratage: '',
    tenure: '',
  };

  const methods = useForm({
    resolver: yupResolver(CalculateSchema),
    defaultValues,
  });

  const { reset, watch, setValue, getValues, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setCustomCalculateLoading(true);
    try {
      const { loanAmount, weight, caratage, tenure } = data;
      const loanAmt = loanAmount.replace(/,/g, '').split('.')[0];

      const baseUrl = 'gold_loan/loan_calculator';
      const apiUrl = getApplyValues('selectedOption')
        ? `${baseUrl}?customer_id=${getApplyValues('selectedOption')}`
        : baseUrl;
      const apiData = {
        tenure_in_months: parseInt(tenure),
        customer_cash_needs: parseInt(loanAmt),
        gold_weight: weight,
        gold_purity_entered_per_1000: caratage,
        valuation_id: valuationId || null,
      };
      ApiCalling.apiCallPost(apiUrl, apiData)
        .then((res) => {
          if (res.data) {
            setTimeout(() => {
              setCustomCalculateLoading(false);
              setIsLoanCalculate(true);
              setGoldValuation(res.data.data);
            }, 2000);
          } else {
            handleLoader(setCustomCalculateLoading, false, 500);
          }
        })
        .catch((error) => {
          console.error(error);
          handleLoader(setCustomCalculateLoading, false, 500);
        });
    } catch (error) {
      console.error(error);
      handleLoader(setCustomCalculateLoading, false, 500);
    }
  });

  const watchFields = watch(['loanAmount', 'weight', 'caratage', 'tenure']);

  const ApplySchema = Yup.object().shape({
    selectedOption: Yup.string().required('Please Select Customer'),
  });
  const applyMethods = useForm({
    resolver: yupResolver(ApplySchema),
    defaultValues: {
      selectedOption: '',
    },
  });
  const {
    handleSubmit: handleApplySubmit,
    trigger,
    control: applyControl,
    getValues: getApplyValues,
    setError: setApplyError,
    reset: applyReset,
  } = applyMethods;

  const onApply = handleApplySubmit(async (data) => {
    setCustomLoading(true);
    try {
      const loanAmt = getValues('loanAmount').replace(/,/g, '').split('.')[0];
      setIsConfirmModel(false);
      const tenureData = parseInt(getValues('tenure'));

      const apiData = {
        tenure_in_months: tenureData,
        customer_cash_needs: parseInt(loanAmt),
        gold_weight: getValues('weight'),
        gold_purity_entered_per_1000: getValues('caratage'),
        valuation_id: valuationId || null,
      };
      const baseUrl = `gold_loan/loan_calculator?customer_id=${data.selectedOption}`;
      const apiUrl = getValuationData?.appointment_id
        ? `${baseUrl}&appointment_id=${getValuationData?.appointment_id}`
        : baseUrl;
      ApiCalling.apiCallPost(apiUrl, apiData)
        .then((res) => {
          setCustomLoading(false);
          setIsConfirmModel(false);
          setCustomCalculateLoading(false);
          if (res.data) {
            const reqData = {
              valuation_id: res.data.data?.valuation_id,
              application_status: ApplicationStatus.VALUATION_CHECK,
            };
            ApiCalling.apiCallPatch('appointment/application_status', reqData).then((resp) => {
              if (resp.data) {
                setIsDrawerOpen(true);
                setValuationDetails(res.data.data);
              }
            });
          } else {
            handleLoader(setCustomLoading, false, 500);
          }
        })
        .catch((err) => {
          console.error(err);
          handleLoader(setCustomLoading, false, 500);
        });
    } catch (error) {
      console.error(error);
      handleLoader(setCustomLoading, false, 500);
    }
  });

  const handleRejectLiquidity = () => {
    setCustomLoading(true);
    const apiData = {
      valuation_id: valuationId,
      application_status: ApplicationStatus.VALUATION_REJECT,
    };
    ApiCalling.apiCallPatch('appointment/application_status', apiData).then((res) => {
      if (res.data) {
        setTimeout(() => {
          reset({ loanAmount: '', weight: '', caratage: '', tenure: '' });
          applyReset({ selectedOption: '' });
          setIsRejectModel(false);
          setIsLoanCalculate(false);
          setGoldValuation(null);
          setCustomLoading(false);
        }, 1000);
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    });
  };

  const getTenureList = () => {
    const apiData = {
      key: 'tenure',
    };
    ApiCalling.apiCallPost('global_config', apiData).then((res) => {
      if (res.data) {
        const formattedData = res.data.data.map((items) => ({
          label: items.toString(),
          value: items.toString(),
        }));

        setTimeout(() => {
          setCustomLoading(false);
          setTenureList(formattedData);
        }, 1000);
      }
    });
  };
  const getCustomerList = () => {
    ApiCalling.apiCallPost('customer/customer_list')
      .then((res) => {
        if (res.data) {
          setCustomerList(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getTenureList();
    getCustomerList();
  }, []);

  useEffect(() => {
    if (getLoanData) {
      const loanAmount = getLoanData?.loanDetails?.customer_cash_needs?.replace(/[^\d.-]/g, '');
      const tenureMatch = getLoanData?.loanDetails?.tenure?.match(/\d+/);
      const tenureValue = tenureMatch ? parseInt(tenureMatch[0], 10) : '';

      applyMethods.reset({ selectedOption: getLoanData?.customerId });
      reset({
        loanAmount: loanAmount ? parseFloat(loanAmount) : '',
        weight: getLoanData?.loanDetails.gold_weight,
        caratage: getLoanData?.loanDetails?.gold_purity_entered_per_1000,
        tenure: tenureValue,
      });
    }
  }, [getLoanData]);

  useEffect(() => {
    if (getValuationData) {
      setValuationId(getValuationData?.valuation_id);
      const loanAmount = getValuationData.customer_cash_needs?.replace(/[^\d.-]/g, '');
      const tenureMatch = getValuationData.tenure?.match(/\d+/);
      const tenureValue = tenureMatch ? parseInt(tenureMatch[0], 10) : '';

      applyMethods.reset({ selectedOption: getValuationData?.customer_id });
      reset({
        loanAmount: loanAmount ? parseFloat(loanAmount) : '',
        weight: getValuationData?.gold_weight,
        caratage: getValuationData?.gold_purity_entered_per_1000,
        tenure: tenureValue,
      });
    }
  }, [getValuationData]);

  const renderCustomerDropdown = (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="search-select-label">Select Customer</InputLabel>
      <Controller
        name="selectedOption"
        control={applyControl}
        render={({ field, fieldState: { error } }) => (
          <>
            <Select
              {...field}
              MenuProps={{
                autoFocus: false,
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 200,
                  },
                },
              }}
              labelId="search-select-label"
              id="search-select"
              label="Select Customer"
              onClose={() => setSearchText('')}
              renderValue={(selectedId) => {
                const selectCustomer = customerList.find((customer) => customer._id === selectedId);
                return selectCustomer
                  ? `${selectCustomer.first_name} ${selectCustomer.last_name}`
                  : '';
              }}
              onChange={(e) => {
                const customerId = e.target.value;
                field.onChange(customerId);
                setValuationId('');
                trigger('selectedOption');
              }}
              error={error}
            >
              <ListSubheader>
                <TextField
                  sx={{ marginTop: '5px' }}
                  size="small"
                  autoFocus
                  placeholder="Type to search..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Escape') {
                      e.stopPropagation();
                    }
                  }}
                />
              </ListSubheader>
              {customerList
                .filter((option) =>
                  `${option.first_name} ${option.last_name}`
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                )
                .map((option, i) => (
                  <MenuItem key={i} value={option._id}>
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          {`${option.first_name} ${option.last_name}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {option.email}
                        </Typography>
                      }
                    />
                  </MenuItem>
                ))}
            </Select>
            {error && <FormHelperText error>{error.message}</FormHelperText>}
          </>
        )}
      />
    </FormControl>
  );
  useEffect(
    () => () => {
      dispatch(clearData());
      dispatch(clearLoanData());
    },
    [dispatch]
  );

  useEffect(() => {
    const { loanAmount, weight, caratage, tenure } = getValues();
    setIsFormValid(!!loanAmount && !!weight && !!caratage && !!tenure);
  }, [watchFields, getValues]);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liquidity Calculator"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Details' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Grid marginBottom={2}>
          <FormProvider methods={applyMethods}>{renderCustomerDropdown}</FormProvider>
        </Grid>
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Card sx={{ p: 3 }}>
                <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
                  <RHFTextField
                    name="loanAmount"
                    label="Required Liquidity Amount"
                    type="text"
                    inputRef={firstFieldRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            variant="body2"
                            sx={{ color: (theme) => theme.palette.text.primary }}
                          >
                            EGP
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    onBlur={(e) => {
                      const updatedValue = appendDecimal(e.target.value);
                      setValue('loanAmount', updatedValue);
                    }}
                  />
                  <RHFTextField name="weight" label="Weight(in gram)" type="number" />
                  <RHFTextField name="caratage" label="Karat" type="number" />
                  <Controller
                    name="tenure"
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth>
                        <InputLabel>Tenure (in months)</InputLabel>
                        <Select
                          {...field}
                          value={field.value || ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          label="Tenure (in months)"
                          error={!!fieldState.error}
                        >
                          {tenureList.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <FormHelperText error>{fieldState.error.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
                {hasPermission('liquidityApplicationProcess.calculator') && (
                  <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                    <LoadingButton
                      loading={customCalculateLoading}
                      disabled={!isFormValid}
                      type="submit"
                      variant="contained"
                    >
                      Calculate Valuation
                    </LoadingButton>
                  </Stack>
                )}
              </Card>
            </FormProvider>
          </Grid>

          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Grid container spacing={1} mb={1}>
                  <Grid sm={6}>
                    <Paper
                      sx={{
                        border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                        padding: 2,
                      }}
                    >
                      <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.gray500}>
                        Total Valuation
                      </Typography>

                      <Typography variant="h1">
                        {' '}
                        {isLoanCalculate ? getValuation?.gold_piece_value : ' *****'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid sm={6}>
                    <Paper
                      sx={{
                        border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                        padding: 2,
                      }}
                    >
                      <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.gray500}>
                        Available Liquidity
                      </Typography>
                      <Typography variant="h1">
                        {' '}
                        {isLoanCalculate ? getValuation?.available_liquidity_to_customer : ' *****'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper
                  sx={{
                    border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                    padding: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        24K sanaddak gold rate
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.gold_rate_at_valuation : ' ***'}
                      </Typography>
                    </Grid>

                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        weight(in gram)
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.gold_weight : ' ***'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Karat
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.gold_purity_entered_per_1000 : ' **'}
                      </Typography>
                    </Grid>

                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Verification & Storage fee
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.admin_fee : ' ***'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Total margin
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.margin : ' **'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Tenure
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.tenure : ' **'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Installment
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.installment : ' ****'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Buyback Amount
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.buyback_amount : ' ****'}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h3" color={(theme) => theme.palette.text.gray500}>
                        Net liquidate cash after fees
                      </Typography>
                    </Grid>
                    <Grid xs={6} textAlign="end">
                      <Typography variant="h3" fontWeight={600}>
                        {isLoanCalculate ? getValuation?.net_liquidate_cash_after_fees : ' ***'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {isLoanCalculate && (
                  <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                    {hasPermission('liquidityApplicationProcess.liquidityApplicationProcess') &&
                      localStorageGet('loginData')?.is_admin === false && (
                        <>
                          {valuationId && (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setIsRejectModel(true);
                              }}
                            >
                              Reject
                            </Button>
                          )}
                          <LoadingButton
                            type="submit"
                            variant="contained"
                            onClick={() => {
                              if (!getApplyValues('selectedOption')) {
                                setApplyError('selectedOption', {
                                  type: 'manual',
                                  message: 'Please Select customer',
                                });
                              } else {
                                setIsConfirmModel(true);
                              }
                            }}
                          >
                            Confirm
                          </LoadingButton>
                        </>
                      )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog
          open={isConfirmModel}
          onClose={() => {
            setCustomLoading(false);
            setIsConfirmModel(false);
            setCustomCalculateLoading(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ '& .MuiDialog-paper': { width: '80%' } }}
          maxWidth="xs"
          TransitionComponent={Grow}
        >
          <DialogTitle id="alert-dialog-title">
            {' '}
            <Typography fontWeight={600} fontSize={16}>
              Confirm
            </Typography>
          </DialogTitle>
          <DialogContent>
            <div className="pb-3">Are you sure you want to Proceed?</div>

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
                loading={customLoading}
                onClick={handleApplySubmit(onApply)}
              >
                Confirm
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isRejectModel}
          onClose={() => {
            setIsRejectModel(false);
            setCustomLoading(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ '& .MuiDialog-paper': { width: '80%' } }}
          maxWidth="xs"
          TransitionComponent={Grow}
        >
          <DialogTitle id="alert-dialog-title">
            {' '}
            <Typography fontSize={16} fontWeight={600}>
              Confirm
            </Typography>
          </DialogTitle>
          <DialogContent>
            <div className="pb-3">Are you sure you want to reject this liquidity?</div>

            <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
              <Button
                variant="text"
                onClick={() => {
                  setIsRejectModel(false);
                }}
              >
                Cancel
              </Button>

              <LoadingButton
                variant="soft"
                color="error"
                loading={customLoading}
                onClick={() => {
                  handleRejectLiquidity();
                }}
              >
                Reject
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>

        <CustomerInventory
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
          }}
          valuation_id={valuationDetails?.valuation_id}
          customer_id={valuationDetails?.customer?._id}
          TotalGoldWeight={valuationDetails?.gold_weight}
        />
      </Container>
    </div>
  );
}
