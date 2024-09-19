/* eslint-disable no-restricted-globals */
/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
/* eslint-disable perfectionist/sort-imports */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Container from '@mui/material/Container';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Card,
  Grid,
  Chip,
  Table,
  Radio,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  RadioGroup,
  TableContainer,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import { useRouter } from 'next/navigation';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';
import { hasPermission } from 'src/utils/permissionUtils';
import { appendDecimal } from 'src/utils/appendDecimalUtils';
import { handleLoader } from 'src/utils/loader';

const fields = [
  { name: 'goldRate', label: 'Gold Rate', type: 'text' },
  { name: 'reserveRate', label: 'Reserve Rate', type: 'number' },
  { name: 'marginRate', label: 'Margin Rate', type: 'number' },
  { name: 'adminRate', label: 'Admin Rate', type: 'number' },
  { name: 'adminRenewalRate', label: 'Admin Renewal Rate', type: 'number' },
  { name: 'penaltyRate', label: 'Penalty Rate', type: 'number' },
  { name: 'liquidationCost', label: 'Liquidation Cost', type: 'number' },
  { name: 'minAdminPurchaseFee', label: 'Minimum Admin Purchase Fee', type: 'number' },
  {
    name: 'kycInCustomerApp',
    label: 'Enable KYC with Digified in Customer Application',
    type: 'radio',
    options: [
      { label: 'YES', value: true },
      { label: 'NO', value: false },
    ],
  },
  {
    name: 'kycInStaffApp',
    label: 'Enable KYC  with Digified in Staff Application',
    type: 'radio',
    options: [
      { label: 'YES', value: true },
      { label: 'NO', value: false },
    ],
  },
];

export default function PriceTagView({ id }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const settings = useSettingsContext();
  const router = useRouter();
  const [tagList, setTagList] = useState([]);
  const [tagId, setTagId] = useState(id);
  const [existingValue, setExistingValue] = useState([
    { name: 'goldRate', value: null },
    { name: 'reserveRate', value: null },
    { name: 'marginRate', value: null },
    { name: 'adminRate', value: null },
    { name: 'adminRenewalRate', value: null },
    { name: 'penaltyRate', value: null },
    { name: 'liquidationCost', value: null },
    { name: 'minAdminPurchaseFee', value: null },
    { name: 'kycInCustomerApp', value: null },
    { name: 'kycInStaffApp', value: null },
  ]);
  const [makerRequestedValue, setMakerRequestedValue] = useState([
    { name: 'goldRate', value: null },
    { name: 'reserveRate', value: null },
    { name: 'marginRate', value: null },
    { name: 'adminRate', value: null },
    { name: 'adminRenewalRate', value: null },
    { name: 'penaltyRate', value: null },
    { name: 'liquidationCost', value: null },
    { name: 'minAdminPurchaseFee', value: null },
    { name: 'kycInCustomerApp', value: null },
    { name: 'kycInStaffApp', value: null },
  ]);
  const [priceTagValue, setPriceTagValue] = useState(null);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const FinanceSchema = yup.object().shape({
    goldRate: yup
      .string()
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
    reserveRate: yup
      .number()
      .typeError('Reserve Rate must be a number')
      .required('Reserve Rate is required')
      .positive('Reserve Rate must be positive'),
    marginRate: yup
      .number()
      .typeError('Margin Rate must be a number')
      .required('Margin Rate is required')
      .positive('Margin Rate must be positive'),
    adminRate: yup
      .number()
      .typeError('Admin Rate must be a number')
      .required('Admin Rate is required')
      .positive('Admin Rate must be positive'),
    adminRenewalRate: yup
      .number()
      .typeError('Admin Renewal Rate must be a number')
      .required('Admin Renewal Rate is required')
      .positive('Admin Renewal Rate must be positive'),
    penaltyRate: yup
      .number()
      .typeError('Penalty Rate must be a number')
      .required('Penalty Rate is required')
      .positive('Penalty Rate must be positive'),
    liquidationCost: yup
      .number()
      .typeError('Liquidation Rate must be a number')
      .required('Liquidation Rate is required')
      .positive('Liquidation Rate must be positive'),
    minAdminPurchaseFee: yup
      .number()
      .typeError('Minimum Admin Purchase Fee must be a number')
      .required('Minimum Admin Purchase Fee is required')
      .positive('Minimum Admin Purchase Fee must be positive'),
    kycInCustomerApp: yup.boolean().required('KYC in customer Application is required'),
    kycInStaffApp: yup.boolean().required('KYC in staff Application is required'),
  });

  const defaultValues = fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue !== undefined ? field.defaultValue : 0;

    return acc;
  }, {});

  const methods = useForm({
    resolver: yupResolver(FinanceSchema),
    defaultValues,
  });
  const { handleSubmit, reset, watch, getValues, setValue, setError } = methods;

  const watchFields = watch([
    'goldRate',
    'reserveRate',
    'marginRate',
    'adminRate',
    'adminRenewalRate',
    'penaltyRate',
    'liquidationCost',
    'minAdminPurchaseFee',
  ]);

  const onSubmit = async (data) => {
    setCustomLoading(true);
    try {
      const {
        goldRate,
        marginRate,
        reserveRate,
        adminRate,
        adminRenewalRate,
        penaltyRate,
        liquidationCost,
        minAdminPurchaseFee,
        kycInCustomerApp,
        kycInStaffApp,
      } = data;
      const apiData = {};
      apiData.tag_id = tagId;
      if (goldRate) apiData.gold_price_24_karate = goldRate;
      if (marginRate) apiData.margin_rate = marginRate;
      if (reserveRate) apiData.reserve_rate = reserveRate;
      if (adminRate) apiData.admin_fee_rate = adminRate;
      if (adminRenewalRate) apiData.admin_fee_rate_renewal = adminRenewalRate;
      if (penaltyRate) apiData.penalty_rate = penaltyRate;
      if (liquidationCost) apiData.liquidation_cost = liquidationCost;
      if (minAdminPurchaseFee) apiData.min_admin_purchase_fees = minAdminPurchaseFee;
      if (kycInCustomerApp) apiData.kyc_in_customer_app = kycInCustomerApp;
      if (kycInStaffApp) apiData.kyc_in_staff_app = kycInStaffApp;
      ApiCalling.apiCallPost('gold_loan/loan_config', apiData).then((res) => {
        if (res.data) {
          getFinanceInput();
          setTimeout(() => {
            router.push(paths.configuration.tag);
            reset();
            setCustomLoading(false);
          }, 2000);
        } else {
          handleLoader(setCustomLoading, false, 500);
          console.log('error', res);
          if (res?.response?.data) {
            console.log(res?.response?.data?.message);
            setError('goldRate', {
              type: 'manual',
              message: res?.response?.data?.message,
            });
          }
        }
      });
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
      reset();
    }
  };
  const fetchLiveGoldRate = () => {
    axios
      .get('https://data-asg.goldprice.org/GetData/EGP-XAU/1')
      .then((res) => {
        const dataString = res?.data[0];
        const goldRateString = dataString.split(',')[1];
        const convertedToGrams = parseFloat(goldRateString) / 31.1034;
        const roundedGoldRate = parseFloat(convertedToGrams).toFixed(2);
        reset((values) => ({ ...values, goldRate: roundedGoldRate }));
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getFinanceInput = async () => {
    try {
      const apiData = {
        tag_id: tagId,
      };
      ApiCalling.apiCallPost(`gold_loan/fetch/loan_config`, apiData)
        .then((res) => {
          if (res.data) {
            const { data } = res.data;
            setPriceTagValue(data);
            setExistingValue([
              { name: 'goldRate', value: data.existing_price.gold_price_24_karate },
              { name: 'reserveRate', value: data.existing_price.reserve_rate },
              { name: 'marginRate', value: data.existing_price.margin_rate },
              { name: 'adminRate', value: data.existing_price.admin_fee_rate },
              { name: 'adminRenewalRate', value: data.existing_price.admin_fee_rate_renewal },
              { name: 'penaltyRate', value: data.existing_price.penalty_rate },
              { name: 'liquidationCost', value: data.existing_price.liquidation_cost },
              { name: 'minAdminPurchaseFee', value: data.existing_price.min_admin_purchase_fees },
              { name: 'kycInCustomerApp', value: data.existing_price.kyc_in_customer_app },
              { name: 'kycInStaffApp', value: data.existing_price.kyc_in_staff_app },
            ]);
            reset({
              goldRate: data.requested_price.requested_gold_price,
              reserveRate: data.requested_price.reserve_rate,
              marginRate: data.requested_price.margin_rate,
              adminRate: data.requested_price.admin_fee_rate,
              adminRenewalRate: data.requested_price.admin_fee_rate_renewal,
              penaltyRate: data.requested_price.penalty_rate,
              liquidationCost: data.requested_price.liquidation_cost,
              minAdminPurchaseFee: data.requested_price.min_admin_purchase_fees,
              kycInCustomerApp: data.requested_price.kyc_in_customer_app,
              kycInStaffApp: data.requested_price.kyc_in_staff_app,
            });
            setHasData(true);
          } else {
            setHasData(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (tagId) {
      getFinanceInput();
    }
  }, [tagId]);
  // const getTagList = () => {
  //   ApiCalling.apiCallGet('gold_loan/tag')
  //     .then((res) => {
  //       if (res.data) {
  //         setTagList(res.data.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };
  // useEffect(() => {
  //   getTagList();
  // }, []);
  const handleTagChange = (event) => {
    const selectedTagId = event.target.value;
    setTagId(selectedTagId);
  };
  useEffect(() => {
    const {
      goldRate,
      reserveRate,
      marginRate,
      adminRate,
      adminRenewalRate,
      penaltyRate,
      liquidationCost,
      minAdminPurchaseFee,
    } = getValues();
    setIsFormValid(
      !!goldRate &&
        reserveRate &&
        marginRate &&
        adminRate &&
        adminRenewalRate &&
        penaltyRate &&
        liquidationCost &&
        minAdminPurchaseFee
    );
  }, [watchFields, getValues]);

  const renderTagDropdown = (
    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
      {!priceTagValue?.is_locked && (
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={customLoading}
          disabled={!isFormValid}
          sx={{ minWidth: '10%' }}
          onClick={handleSubmit(onSubmit)}
        >
          {hasPermission('priceTag.checker') && priceTagValue?.status === 1
            ? 'VERIFY'
            : hasPermission('priceTag.approver') && priceTagValue?.status === 2
              ? 'Approve'
              : hasPermission('priceTag.maker')
                ? 'SAVE'
                : 'SAVE'}
        </LoadingButton>
      )}
    </Box>
  );

  const UserInfoCard = ({ profile_image, userRole, name, email, date }) => (
    <Card sx={{ display: 'flex', padding: 2, marginTop: 2, marginBottom: 2 }}>
      <Avatar sx={{ marginRight: 2 }} src={profile_image} alt={name} />
      <div style={{ flexGrow: 1 }}>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {userRole}
        </Typography>
        <Typography variant="body2"> {date}</Typography>
      </div>
      <Chip label="Requested For Verification" color="warning" variant="soft" />
    </Card>
  );
  useEffect(() => {
    if (priceTagValue) {
      if (
        (priceTagValue?.status === '' || priceTagValue?.status === 3) &&
        priceTagValue?.is_active === false
      ) {
        reset({
          goldRate: parseFloat(priceTagValue.requested_price.requested_gold_price),
          reserveRate: priceTagValue.requested_price.reserve_rate,
          marginRate: priceTagValue.requested_price.margin_rate,
          adminRate: priceTagValue.requested_price.admin_fee_rate,
          adminRenewalRate: priceTagValue.requested_price.admin_fee_rate_renewal,
          penaltyRate: priceTagValue.requested_price.penalty_rate,
          liquidationCost: priceTagValue.requested_price.liquidation_cost,
          minAdminPurchaseFee: priceTagValue.requested_price.min_admin_purchase_fees,
          kycInCustomerApp: priceTagValue.requested_price.kyc_in_customer_app,
          kycInStaffApp: priceTagValue.requested_price.kyc_in_staff_app,
        });
      } else if (
        (priceTagValue?.status === '' || priceTagValue?.status === 3) &&
        priceTagValue.is_active === true
      ) {
        reset({
          goldRate: parseFloat(priceTagValue.existing_price.gold_price_24_karate),
          reserveRate: priceTagValue.existing_price.reserve_rate,
          marginRate: priceTagValue.existing_price.margin_rate,
          adminRate: priceTagValue.existing_price.admin_fee_rate,
          adminRenewalRate: priceTagValue.existing_price.admin_fee_rate_renewal,
          penaltyRate: priceTagValue.existing_price.penalty_rate,
          liquidationCost: priceTagValue.existing_price.liquidation_cost,
          minAdminPurchaseFee: priceTagValue.existing_price.min_admin_purchase_fees,
          kycInCustomerApp: priceTagValue.existing_price.kyc_in_customer_app,
          kycInStaffApp: priceTagValue.existing_price.kyc_in_staff_app,
        });
      } else if (priceTagValue.status === 1) {
        setExistingValue([
          {
            name: 'goldRate',
            value: parseFloat(priceTagValue.existing_price.gold_price_24_karate),
          },
          { name: 'reserveRate', value: priceTagValue.existing_price.reserve_rate },
          { name: 'marginRate', value: priceTagValue.existing_price.margin_rate },
          { name: 'adminRate', value: priceTagValue.existing_price.admin_fee_rate },
          { name: 'adminRenewalRate', value: priceTagValue.existing_price.admin_fee_rate_renewal },
          { name: 'penaltyRate', value: priceTagValue.existing_price.penalty_rate },
          { name: 'liquidationCost', value: priceTagValue.existing_price.liquidation_cost },
          {
            name: 'minAdminPurchaseFee',
            value: priceTagValue.existing_price.min_admin_purchase_fees,
          },
          {
            name: 'kycInCustomerApp',
            value: priceTagValue.existing_price.kyc_in_customer_app,
          },
          {
            name: 'kycInStaffApp',
            value: priceTagValue.existing_price.kyc_in_staff_app,
          },
        ]);
        reset({
          goldRate: parseFloat(priceTagValue.requested_price.requested_gold_price),
          reserveRate: priceTagValue.requested_price.reserve_rate,
          marginRate: priceTagValue.requested_price.margin_rate,
          adminRate: priceTagValue.requested_price.admin_fee_rate,
          adminRenewalRate: priceTagValue.requested_price.admin_fee_rate_renewal,
          penaltyRate: priceTagValue.requested_price.penalty_rate,
          liquidationCost: priceTagValue.requested_price.liquidation_cost,
          minAdminPurchaseFee: priceTagValue.requested_price.min_admin_purchase_fees,
          kycInCustomerApp: priceTagValue.requested_price.kyc_in_customer_app,
          kycInStaffApp: priceTagValue.requested_price.kyc_in_staff_app,
        });
      } else if (priceTagValue.status === 2) {
        setExistingValue([
          {
            name: 'goldRate',
            value: parseFloat(priceTagValue.existing_price.gold_price_24_karate),
          },
          { name: 'reserveRate', value: priceTagValue.existing_price.reserve_rate },
          { name: 'marginRate', value: priceTagValue.existing_price.margin_rate },
          { name: 'adminRate', value: priceTagValue.existing_price.admin_fee_rate },
          { name: 'adminRenewalRate', value: priceTagValue.existing_price.admin_fee_rate_renewal },
          { name: 'penaltyRate', value: priceTagValue.existing_price.penalty_rate },
          { name: 'liquidationCost', value: priceTagValue.existing_price.liquidation_cost },
          {
            name: 'minAdminPurchaseFee',
            value: priceTagValue.existing_price.min_admin_purchase_fees,
          },
          {
            name: 'kycInCustomerApp',
            value: priceTagValue.existing_price.kyc_in_customer_app,
          },
          {
            name: 'kycInStaffApp',
            value: priceTagValue.existing_price.kyc_in_staff_app,
          },
        ]);
        setMakerRequestedValue([
          {
            name: 'goldRate',
            value: parseFloat(priceTagValue.requested_maker.requested_gold_price),
          },
          { name: 'reserveRate', value: priceTagValue.requested_maker.reserve_rate },
          { name: 'marginRate', value: priceTagValue.requested_maker.margin_rate },
          { name: 'adminRate', value: priceTagValue.requested_maker.admin_fee_rate },
          { name: 'adminRenewalRate', value: priceTagValue.requested_maker.admin_fee_rate_renewal },
          { name: 'penaltyRate', value: priceTagValue.requested_maker.penalty_rate },
          { name: 'liquidationCost', value: priceTagValue.requested_maker.liquidation_cost },
          {
            name: 'minAdminPurchaseFee',
            value: priceTagValue.requested_maker.min_admin_purchase_fees,
          },
          {
            name: 'kycInCustomerApp',
            value: priceTagValue.requested_maker.kyc_in_customer_app,
          },
          {
            name: 'kycInStaffApp',
            value: priceTagValue.requested_maker.kyc_in_staff_app,
          },
        ]);
        reset({
          goldRate: parseFloat(priceTagValue.requested_price.requested_gold_price),
          reserveRate: priceTagValue.requested_price.reserve_rate,
          marginRate: priceTagValue.requested_price.margin_rate,
          adminRate: priceTagValue.requested_price.admin_fee_rate,
          adminRenewalRate: priceTagValue.requested_price.admin_fee_rate_renewal,
          penaltyRate: priceTagValue.requested_price.penalty_rate,
          liquidationCost: priceTagValue.requested_price.liquidation_cost,
          minAdminPurchaseFee: priceTagValue.requested_price.min_admin_purchase_fees,
          kycInCustomerApp: priceTagValue.requested_price.kyc_in_customer_app,
          kycInStaffApp: priceTagValue.requested_price.kyc_in_staff_app,
        });
      }
    }
  }, [priceTagValue, reset]);
  const renderTableRow = () => {
    if (
      priceTagValue.status === '' ||
      (priceTagValue?.status === 3 && priceTagValue.is_active === false)
    ) {
      return (
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Key</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      );
    } else if (
      priceTagValue.status === '' ||
      (priceTagValue?.status === 3 && priceTagValue.is_active === true)
    ) {
      return (
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Key</TableCell>
          <TableCell>Existing Value</TableCell>
        </TableRow>
      );
    } else if (priceTagValue.status === 1) {
      return (
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Key</TableCell>
          <TableCell>Existing Value</TableCell>
          <TableCell>Maker's Requested Value</TableCell>
        </TableRow>
      );
    } else if (priceTagValue.status === 2) {
      return (
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Key</TableCell>
          <TableCell>Existing Value</TableCell>
          <TableCell>Maker's Requested Value</TableCell>
          <TableCell>Checker's Requested Value</TableCell>
        </TableRow>
      );
    } else {
      return null;
    }
  };
  const renderTableBody = () => {
    return fields.map((field, index) => {
      const existingField = existingValue?.find((ev) => ev.name === field.name);
      const makerRequestedField = makerRequestedValue?.find((ev) => ev.name === field.name);
      const fieldLabel = field.label !== 'Gold Rate' ? `${field.label} (%)` : field.label;
      const isLocked = priceTagValue.is_locked;
      const isKycField = field.type === 'radio';

      const renderInputField = () => {
        if (isKycField) {
          const value = watch(field.name) !== undefined ? watch(field.name) : true; // Ensure a controlled value
          return (
            <RadioGroup
              row
              value={value} // For controlled input with RHF
              onChange={(e) => setValue(field.name, e.target.value === 'true')}
            >
              {field.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={String(option.value)}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          );
        } else {
          return (
            <RHFTextField
              sx={{ width: '60%' }}
              id={field.name}
              label={fieldLabel}
              type={field.type}
              name={field.name}
              inputRef={inputRef}
              onBlur={(e) => {
                const updatedValue = appendDecimal(e.target.value);
                setValue(field.name, updatedValue);
              }}
              InputProps={
                field.label === 'Gold Rate'
                  ? {
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
                    }
                  : undefined
              }
            />
          );
        }
      };

      if (priceTagValue.status === '' || priceTagValue?.status === 3) {
        return (
          <TableRow key={field.name}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{field.label}</TableCell>
            <TableCell>
              {isLocked ? (
                <Typography variant="span">
                  {field.name !== 'goldRate'
                    ? watch(field.name)
                      ? `${watch(field.name)} %`
                      : '-'
                    : watch(field.name) || '-'}
                </Typography>
              ) : (
                <>
                  {renderInputField()}
                  {field.label === 'Gold Rate' && (
                    <IconButton onClick={fetchLiveGoldRate}>
                      <RestartAltIcon />
                    </IconButton>
                  )}
                </>
              )}
            </TableCell>
          </TableRow>
        );
      } else if (priceTagValue.status === 1) {
        return (
          <TableRow key={field.name}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{field.label}</TableCell>
            <TableCell>{existingField?.value ? existingField.value : '-'}</TableCell>
            <TableCell>
              {isLocked ? (
                <span>
                  {field.name !== 'goldRate'
                    ? watch(field.name)
                      ? `${watch(field.name)} %`
                      : '-'
                    : watch(field.name) || '-'}
                </span>
              ) : (
                <>
                  {renderInputField()}
                  {field.label === 'Gold Rate' && (
                    <IconButton onClick={fetchLiveGoldRate}>
                      <RestartAltIcon />
                    </IconButton>
                  )}
                </>
              )}
            </TableCell>
          </TableRow>
        );
      } else if (priceTagValue.status === 2) {
        return (
          <TableRow key={field.name}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{field.label}</TableCell>
            <TableCell>{existingField.value ? existingField.value : '-'}</TableCell>
            <TableCell>{makerRequestedField.value ? makerRequestedField.value : '-'}</TableCell>
            <TableCell>
              {isLocked ? (
                <span>
                  {field.name !== 'goldRate'
                    ? watch(field.name)
                      ? `${watch(field.name)} %`
                      : '-'
                    : watch(field.name) || '-'}
                </span>
              ) : (
                <>
                  {renderInputField()}
                  {field.label === 'Gold Rate' && (
                    <IconButton onClick={fetchLiveGoldRate}>
                      <RestartAltIcon />
                    </IconButton>
                  )}
                </>
              )}
            </TableCell>
          </TableRow>
        );
      } else {
        return null;
      }
    });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Price Tag"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'List', href: paths.configuration.tag },
          { name: 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid item marginBottom={2}>
          {renderTagDropdown}
        </Grid>
        {loading ? (
          <Loader />
        ) : hasData ? (
          <TableContainer sx={{ position: 'relative' }}>
            <Table>
              <TableHead>{renderTableRow()}</TableHead>
              <TableBody>{renderTableBody()}</TableBody>
            </Table>
          </TableContainer>
        ) : (
          <NoResultFound />
        )}

        <Grid container alignItems="center" spacing={2}>
          {(priceTagValue?.status === 1 || priceTagValue?.status === 2) && (
            <Grid item xs>
              <UserInfoCard
                profile_image={
                  priceTagValue?.maker?.profile_image
                    ? `${s3URL}/${priceTagValue?.maker?._id}/${priceTagValue?.maker?.profile_image}`
                    : ''
                }
                userRole="Maker"
                name={priceTagValue?.maker?.full_name}
                email={priceTagValue?.maker?.email}
                date={`created on ${globalUTCFormatDate(priceTagValue?.maker?.config_update_date)}`}
              />
            </Grid>
          )}
          {priceTagValue?.status === 2 && (
            <Grid item xs>
              <UserInfoCard
                profile_image={
                  priceTagValue?.checker?.profile_image
                    ? `${s3URL}/${priceTagValue?.checker?._id}/${priceTagValue?.checker?.profile_image}`
                    : ''
                }
                userRole="Checker"
                name={priceTagValue?.checker?.full_name}
                email={priceTagValue?.checker?.email}
                date={`verified on ${globalUTCFormatDate(
                  priceTagValue?.checker?.config_update_date
                )}`}
              />
            </Grid>
          )}
        </Grid>
      </FormProvider>
    </Container>
  );
}
