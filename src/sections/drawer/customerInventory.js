/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
import AWS from 'aws-sdk';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect, useCallback } from 'react';
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import { yupResolver } from '@hookform/resolvers/yup';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Close, Delete } from '@mui/icons-material';
import {
  List,
  Grow,
  Drawer,
  Button,
  Dialog,
  ListItem,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  DialogContent,
  ListItemAvatar,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { ApplicationStatus } from 'src/ENUMS/enums';
import { setAgreementData } from 'src/redux/agreementSlice';

import Image from 'src/components/image';
import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFUpload, RHFTextField } from 'src/components/hook-form';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

import { handleapplicationStatus } from '../loan-calculator/LoanCalculatorView';

export default function CustomerInventory({
  open,
  onClose,
  valuation_id,
  customer_id,
  TotalGoldWeight,
}) {
  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY;
  const secretAccessKey = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY;
  const region = process.env.NEXT_PUBLIC_REGION;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const router = useRouter();
  const dispatch = useDispatch();
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [isOpenBarcodeModel, setIsOpenBarcodeModel] = useState(false);
  const [isBarcodeAutoGenerate, setIsBarcodeAutoGenerate] = useState(false);
  const [details, setDatails] = useState(null);

  const InventorySchema = Yup.object().shape({
    name: Yup.string().required('Gold Piece Name is required'),
    gold_weight: Yup.number()
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

    gold_purity_entered_per_1000: Yup.number()
      .typeError('Karat must be a number')
      .required('Karat is required')
      .positive('Karat is required & must be positive')
      .max(24, 'Karat cannot be more than 24'),
    asset_images: Yup.mixed().required('Gold piece image is required'),
  });

  const defaultValues = {
    name: '',
    gold_weight: '',
    gold_purity_entered_per_1000: '',
    specification: '',
    asset_images: null,
    barcode: '',
  };
  const methods = useForm({
    resolver: yupResolver(InventorySchema),
    defaultValues,
  });
  const barcodeRef = useRef(null);
  let focusInterval;

  const focusBarcodeForTwoMinutes = () => {
    focusInterval = setInterval(() => {
      if (barcodeRef.current) {
        barcodeRef.current.focus();
      }
    }, 500);

    setTimeout(() => {
      clearInterval(focusInterval);
    }, 50);
  };

  const { reset, handleSubmit, setValue, getValues, watch } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      setDatails(data);
      if (data.barcode === '' && isBarcodeAutoGenerate === false) {
        setIsOpenBarcodeModel(true);
      } else {
        setInventoryDetails((prevDetails) => [...prevDetails, data]);
        reset();
        setIsBarcodeAutoGenerate(false);
      }
    } catch (error) {
      console.error(error);
      reset();
    }
  });
  const validateGoldWeight = (assets) => {
    const totalGoldWeight = assets.reduce(
      (total, asset) => total + parseFloat(asset.gold_weight),
      0
    );
    if (totalGoldWeight !== TotalGoldWeight) {
      return `The inventory gold weight does not match the valuation gold weight.`;
    }
    return null;
  };
  const generateAgreement = async () => {
    const validationResult = validateGoldWeight(inventoryDetails);
    if (validationResult) {
      ToasteMessage(validationResult, 'error');
    } else {
      setCustomLoading(true);
      const transformedInventoryDetails = inventoryDetails.map((item, index) => {
        const itemName = item.name.toLowerCase();
        const extension = item.asset_images.path.split('.').pop();
        const newFileName = `${itemName}_${index + 1}.${extension}`;

        return {
          ...item,
          asset_images: newFileName,
        };
      });
      const apiData = {
        customer_id,
        valuation_id,
        item: transformedInventoryDetails,
      };
      const res = await ApiCalling.apiCallPost('loan', apiData);

      if (res.data) {
        const fileUrl = await uploadToS3(customer_id, res.data.data.liquidity_number);
        if (fileUrl) {
          handleapplicationStatus(valuation_id, ApplicationStatus.GENERATE_AGREEMENT);
          dispatch(
            setAgreementData({
              agreements: res.data.data.agreements,
              valuationId: valuation_id,
              loan_id: res.data.data.liquidity_id,
              liquidity_number: res.data.data.liquidity_number,
              customerId: customer_id,
            })
          );
          router.push(paths.agreement);
          ToasteMessage(res?.data?.message, 'success');
          setInventoryDetails([]);
          handleLoader(setCustomLoading, false, 500);
        }
      } else {
        handleLoader(setCustomLoading, false, 500);
      }
    }
  };
  const uploadToS3 = async (customerId, liquidityNumber) => {
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();
    try {
      const uploadPromises = inventoryDetails.map(async (item, index) => {
        const { path, preview } = item.asset_images;
        const itemName = item.name.toLowerCase();
        const extension = path.split('.').pop();
        const newFileName = `${itemName}_${index + 1}.${extension}`;
        const fileName = `${customerId}/${liquidityNumber}/${newFileName}`;
        const blobResponse = await fetch(preview);
        const blob = await blobResponse.blob();
        const file = new File([blob], path, { type: blob.type });

        const params = {
          Bucket: bucket,
          Key: fileName,
          Expires: 60,
          ContentType: blob.type,
          ACL: 'public-read',
        };

        const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': blob.type,
          },
          body: file,
        });

        if (response.ok) {
          const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
          return fileUrl;
        }
        throw new Error(`Failed to upload file ${file.name}: ${response.statusText}`);
      });

      const uploadedFilesUrls = await Promise.all(uploadPromises);

      return uploadedFilesUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const watchFields = watch([
    'name',
    'gold_weight',
    'gold_purity_entered_per_1000',
    'asset_images',
  ]);

  const handleDropSingleFile = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const preview = URL.createObjectURL(file);
        const newFile = Object.assign(file, { preview });

        setValue('asset_images', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const renderForm = (
    <Stack spacing={2} mt={2} sx={{ backgroundColor: '#fff', p: 3, borderRadius: 3 }}>
      <RHFTextField id="outlined-email" label="Gold Piece Name" type="text" name="name" />
      <RHFTextField id="outlined-email" label="Weight (in gram)" type="number" name="gold_weight" />
      <RHFTextField
        id="outlined-email"
        label="Karat"
        type="number"
        name="gold_purity_entered_per_1000"
      />
      <RHFTextField
        id="outlined-email"
        label="Barcode (Leave blank for system generated barcode.)"
        name="barcode"
        inputRef={barcodeRef}
      />
      <RHFTextArea id="outlined-email" label="specification" type="text" name="specification" />

      <RHFUpload
        name="asset_images"
        maxSize={10485760}
        onDrop={handleDropSingleFile}
        onDelete={() => setValue('asset_images', null, { shouldValidate: true })}
      />
    </Stack>
  );

  const handleRemoveItem = (index) => {
    setInventoryDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));
    setIsBarcodeAutoGenerate(false);
  };

  useEffect(() => {
    const { name, gold_weight, gold_purity_entered_per_1000, asset_images } = getValues();

    setIsFormValid(!!name && !!gold_weight && !!gold_purity_entered_per_1000 && !!asset_images);
  }, [watchFields, getValues]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => {
          onClose();
          reset();
          setCustomLoading(false);
        }}
      >
        <Box
          sx={{
            width: 500,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
          role="presentation"
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <Typography
              variant="h2"
              mb={2}
              className="d-flex align-items-center justify-space-between"
            >
              Liquidity Inventory Details
              <Button
                onClick={() => {
                  onClose();
                  reset();
                }}
                sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
              >
                <Close />
              </Button>
            </Typography>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
            {inventoryDetails?.length > 0 && (
              <Box sx={{ p: 3, mt: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff' }}>
                <Typography variant="h2">Added Inventory</Typography>
                <List>
                  {inventoryDetails.map((item, i) => (
                    <ListItem
                      sx={{ px: 0 }}
                      key={i}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveItem(i)}
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        {item?.asset_images instanceof File ? (
                          <Image
                            src={URL.createObjectURL(item.asset_images)}
                            alt="img"
                            width={32}
                            height={32}
                            sx={{ borderRadius: 1 }}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No image
                          </Typography>
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ sx: { fontSize: 16, fontWeight: 'medium' } }}
                        primary={`${item.name} - ${item.gold_purity_entered_per_1000} K, ${item.gold_weight} gram`}
                        secondary={item.specification}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="space-between" gap={2}>
            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              variant="outlined"
              onClick={onSubmit}
              disabled={!isFormValid}
            >
              Save
            </LoadingButton>
            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              variant="contained"
              disabled={inventoryDetails.length === 0}
              onClick={generateAgreement}
              loading={customLoading}
            >
              Generate Aggreement
            </LoadingButton>
          </Box>
        </Box>
      </Drawer>
      <Dialog
        open={isOpenBarcodeModel}
        onClose={() => {
          setIsOpenBarcodeModel(false);
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
            Missed to entered barcode ?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography className="pb-3">
            Barcode not entered. The system will generate a barcode automatically. Are you sure you
            want to continue?
          </Typography>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsBarcodeAutoGenerate(false);
                setIsOpenBarcodeModel(false);
                if (barcodeRef.current) {
                  barcodeRef.current.focus();
                  focusBarcodeForTwoMinutes();
                }
              }}
            >
              Cancel
            </Button>

            <LoadingButton
              variant="soft"
              loading={customLoading}
              onClick={() => {
                setIsBarcodeAutoGenerate(true);
                setIsOpenBarcodeModel(false);
                setInventoryDetails((prevDetails) => [...prevDetails, details]);
                reset();
                setIsBarcodeAutoGenerate(false);
                if (barcodeRef.current) {
                  barcodeRef.current.blur();
                }

                clearInterval(focusInterval);
              }}
            >
              Confirm
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
