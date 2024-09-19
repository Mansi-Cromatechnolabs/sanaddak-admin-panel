/* eslint-disable arrow-body-style */

'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import { Box, Stack, Container } from '@mui/system';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {
  Grow,
  Chip,
  Grid,
  Table,
  Avatar,
  Drawer,
  Button,
  Dialog,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableFooter,
  DialogTitle,
  DialogContent,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import { grey } from 'src/theme/palette';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { KycStatus, ReviewStatus } from 'src/ENUMS/enums';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import Image from 'src/components/image';
import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const Kyc = () => {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const settings = useSettingsContext();
  const [isKycDrawerOpen, setIsKycDrawerOpen] = useState(false);
  const [isOpenDisapproveModel, setIsOpenDisapproveModel] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kyc, setKyc] = useState([]);

  const [loading, setLoading] = useState(true);

  const [checkboxes, setCheckboxes] = useState({
    frontSide: false,
    backSide: false,
    selfie: false,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const isAllChecked = checkboxes.frontSide && checkboxes.backSide && checkboxes.selfie;

  const disapproveSchema = Yup.object().shape({
    reasonForDisapprove: Yup.string().required('Reason is required'),
  });

  const methods = useForm({
    resolver: yupResolver(disapproveSchema),
    defaultValues: {
      reasonForDisapprove: '',
    },
  });

  const { reset, handleSubmit, getValues } = methods;

  const onSubmit = handleSubmit(async (d) => {
    handleKYCProcess(ReviewStatus.Disapproved);
  });

  const getKycList = () => {
    ApiCalling.apiCallGet('gold_loan/customer_kyc_details')
      .then((res) => {
        if (res.data) {
          setKyc(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getKycList();
  }, []);

  const handleOpenDrawer = (kycItem) => {
    setSelectedKyc(kycItem);
    setIsKycDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsKycDrawerOpen(false);
  };
  const handleKYCProcess = (status) => {
    const data = {
      customer_id: selectedKyc?.customer_id,
      review_by: localStorageGet('loginData')?.id,
      review_status: status,
      ...(status === ReviewStatus.Disapproved && { reason: getValues('reasonForDisapprove') }),
    };
    ApiCalling.apiCallPost('gold_loan/kyc_approved_disapproved', data)
      .then((res) => {
        if (res.data) {
          setIsOpenDisapproveModel(false);
          setIsKycDrawerOpen(false);
          reset({ reasonForDisapprove: '' });
          getKycList();

          ToasteMessage('KYC updated Successfully', 'success');
        } else {
          setIsOpenDisapproveModel(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const kycDrawer = () => (
    <Drawer anchor="right" open={isKycDrawerOpen} onClose={handleCloseDrawer}>
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
        {selectedKyc && (
          <>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
              }}
            >
              <Typography
                variant="h2"
                mb={2}
                className="d-flex align-items-center gap-2 justify-space-between"
              >
                KYC Details
                <Button
                  onClick={handleCloseDrawer}
                  sx={{
                    width: 28,
                    height: 28,
                    minWidth: 'auto',
                    marginRight: 1,
                    marginLeft: 'auto',
                  }}
                >
                  <Close />
                </Button>
              </Typography>
              {selectedKyc.kyc_documents && Object.keys(selectedKyc.kyc_documents).length > 0 && (
                <>
                  <Box>
                    <Typography color={grey[500]} variant="h4" className="mb-1">
                      Uploaded Document
                    </Typography>
                    <Image
                      sx={{ borderRadius: 1 }}
                      src={`${s3URL}/${selectedKyc.customer_id}/KYC/Document/${selectedKyc.kyc_documents.doc_front_side}`}
                      alt="kyc"
                      width="100%"
                      height={130}
                    />
                    <Image
                      sx={{ borderRadius: 1, marginTop: 1 }}
                      src={`${s3URL}/${selectedKyc.customer_id}/KYC/Document/${selectedKyc?.kyc_documents.doc_back_side}`}
                      alt="kyc"
                      width="100%"
                      height={130}
                    />
                  </Box>
                  <Box>
                    <Typography color={grey[500]} variant="h4" mt={2}>
                      Uploaded Selfie
                    </Typography>
                    <Grid container spacing={1}>
                      {selectedKyc?.kyc_documents?.live_capture?.map((d, i) => {
                        return (
                          <Grid item xs={4} key={i}>
                            <Image
                              sx={{ borderRadius: 1, marginTop: 1 }}
                              src={`${s3URL}/${selectedKyc.customer_id}/KYC/Document/${d}`}
                              alt="kyc"
                              width="100%"
                              height={130}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </>
              )}
              {selectedKyc.kyc_status !== KycStatus.CUSTOMER_DOCUMENT_UPLOADED && (
                <>
                  {selectedKyc.front_image_url && (
                    <Box>
                      <Typography color={grey[500]} variant="h4" className="mb-1" mt={1}>
                        Front Side Document
                      </Typography>
                      <Image
                        sx={{ borderRadius: 1 }}
                        src={`${s3URL}/${selectedKyc.customer_id}/KYC/${selectedKyc.front_image_url}`}
                        alt="kyc"
                        width="100%"
                        height={130}
                      />
                    </Box>
                  )}
                  {selectedKyc.back_image_url && (
                    <Box>
                      <Typography color={grey[500]} variant="h4" className="mb-1" mt={1}>
                        Back Side Document
                      </Typography>
                      <Image
                        sx={{ borderRadius: 1 }}
                        src={`${s3URL}/${selectedKyc.customer_id}/KYC/${selectedKyc.back_image_url}`}
                        alt="kyc"
                        width="100%"
                        height={130}
                      />
                    </Box>
                  )}
                  {selectedKyc.document_type && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        KYC Document
                      </Typography>
                      <Typography variant="h3" className="mb-2">
                        {selectedKyc.document_type}
                      </Typography>
                    </Box>
                  )}
                  {selectedKyc.first_name && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        Full Name
                      </Typography>
                      <Typography
                        variant="h3"
                        className="mb-2"
                      >{`${selectedKyc.first_name} ${selectedKyc.last_name}`}</Typography>
                    </Box>
                  )}
                  {selectedKyc.national_id && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        National ID Number
                      </Typography>
                      <Typography variant="h3" className="mb-2">
                        {selectedKyc.national_id}
                      </Typography>
                    </Box>
                  )}
                  {selectedKyc.expiration_date && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        ID Expire Date
                      </Typography>
                      <Typography variant="h3" className="mb-2">
                        {globalUTCFormatDate(selectedKyc.expiration_date)}
                      </Typography>
                    </Box>
                  )}
                  {selectedKyc.address && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        Address
                      </Typography>
                      <Typography
                        variant="h3"
                        className="mb-2"
                      >{`${selectedKyc.address} ${selectedKyc.address_details}`}</Typography>
                    </Box>
                  )}
                  {selectedKyc.face_image_url && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        Uploaded Selfie
                      </Typography>
                      <Image
                        sx={{ borderRadius: 1 }}
                        src={`${s3URL}/${selectedKyc.customer_id}/KYC/${selectedKyc.face_image_url}`}
                        alt="kyc"
                        width={134}
                        height={134}
                      />
                    </Box>
                  )}
                  {selectedKyc.remarks && (
                    <Box className="mt-4">
                      <Typography color={grey[500]} variant="h4" className="mb-1">
                        Remark
                      </Typography>
                      <Typography color={grey[700]} variant="h3" className="mb-2">
                        {selectedKyc.remarks}
                      </Typography>
                    </Box>
                  )}
                  <Box className="mt-4">
                    <Typography color={grey[500]} variant="h3" className="mb-1">
                      CheckList
                    </Typography>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="frontSide"
                            checked={checkboxes.frontSide}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Verified front side document"
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="backSide"
                            checked={checkboxes.backSide}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Verified back side document"
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="selfie"
                            checked={checkboxes.selfie}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Verified selfie"
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
            <>
              {hasPermission('kyc.approve') && (
                <>
                  {selectedKyc?.kyc_status === KycStatus.Verified &&
                    selectedKyc?.review_status !== ReviewStatus.Approved && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <LoadingButton
                          fullWidth
                          size="large"
                          variant="soft"
                          sx={{ marginTop: 2 }}
                          onClick={() => {
                            handleCloseDrawer();
                            setIsOpenDisapproveModel(true);
                          }}
                        >
                          Disapprove
                        </LoadingButton>
                        <LoadingButton
                          fullWidth
                          color="inherit"
                          size="large"
                          variant="contained"
                          sx={{ marginTop: 2 }}
                          disabled={!isAllChecked}
                          onClick={() => {
                            handleKYCProcess(ReviewStatus.Approved);
                          }}
                        >
                          Approve
                        </LoadingButton>
                      </Box>
                    )}
                </>
              )}
            </>
          </>
        )}
      </Box>
    </Drawer>
  );
  const statusToLabelAndColor = (kyc_status, review_status) => {
    switch (kyc_status) {
      case '':
        return { label: 'Pending', color: 'info' };

      case KycStatus.UnVerified:
        return { label: 'Unverified', color: 'error' };

      case KycStatus.Verified:
        switch (review_status) {
          case ReviewStatus.Approved:
            return { label: 'Approved', color: 'success' };
          case ReviewStatus.Disapproved:
            return { label: 'Disapproved', color: 'warning' };
          default:
            return { label: 'Verified', color: 'secondary' };
        }

      case KycStatus.CUSTOMER_DOCUMENT_UPLOADED:
        return { label: 'Document Uploaded', color: 'primary' };

      default:
        return { label: 'Unknown', color: 'default' };
    }
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="KYC"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {loading ? (
        <Loader />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Digified Id</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Document Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            {kyc?.length > 0 ? (
              <TableBody>
                {kyc?.map((item, i) => {
                  const { label, color } = statusToLabelAndColor(
                    item.kyc_status,
                    item.review_status
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={
                            item.profile_image
                              ? `${s3URL}/${item.customer_id}/${item.profile_image}`
                              : ''
                          }
                          alt={item.first_name}
                        />
                        {`${item.first_name} ${item.last_name}`}
                      </TableCell>
                      <TableCell>{item.user_email ? item.user_email : '-'}</TableCell>
                      <TableCell>{item.mobile_number ? item.mobile_number : '-'}</TableCell>
                      <TableCell>{item.serial_number}</TableCell>
                      <TableCell>Egyptian Nation Card</TableCell>
                      <TableCell>{globalUTCFormatDate(item.kyc_date)}</TableCell>
                      <TableCell>
                        <Chip variant="soft" label={label} color={color} />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDrawer(item)}>
                          <RemoveRedEyeIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                    No Data Found
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}

      {kycDrawer()}
      <Dialog
        open={isOpenDisapproveModel}
        onClose={() => {
          setIsOpenDisapproveModel(false);
          reset({ reasonForDisapprove: '' });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
        TransitionProps={{
          onEntered: () => {
            if (selectedKyc !== null) {
              reset({ reasonForDisapprove: '' });
            }
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            Reason for Disapprove
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2} sx={{ margin: 1 }}>
              <RHFTextArea name="reasonForDisapprove" label="Reason for Disapprove" />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ m: 3 }}>
              <LoadingButton type="submit" variant="contained" fullWidth>
                Save
              </LoadingButton>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Kyc;
