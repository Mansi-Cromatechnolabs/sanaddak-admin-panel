/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import { useRouter } from 'next/navigation';
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import {
  Grow,
  Table,
  Switch,
  Dialog,
  Button,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  DialogTitle,
  TableFooter,
  DialogContent,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { error, success } from 'src/theme/palette';
import Link from 'next/link';

export default function CustomerList({ onDelete, list }) {
  const router = useRouter();
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const [isShowDeleteModel, setIsShowDeleteModel] = useState(false);
  const [isShowKYCModel, setIsShowKYCModel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [checkedState, setCheckedState] = useState({});
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    const initialState = list.reduce((acc, curr) => {
      acc[curr._id] = curr.is_active;
      return acc;
    }, {});
    setCheckedState(initialState);
  }, [list]);

  const handleChange = (event, id) => {
    const newCheckedState = event.target.checked;
    setCheckedState((prevState) => ({
      ...prevState,
      [id]: newCheckedState,
    }));
    handleStatusChange(id, newCheckedState);
  };

  const handleDeleteCustomer = () => {
    setCustomLoading(true);
    const apiData = {
      customer_id: deleteId,
      is_deleted: true,
    };
    ApiCalling.apiCallPatch(`customer/customer_status`, apiData)
      .then((res) => {
        if (res.data) {
          setTimeout(() => {
            setIsShowDeleteModel(false);
            onDelete();
            setCustomLoading(false);
          }, 2000);
        } else {
          handleLoader(setCustomLoading, false, 500);
        }
      })
      .catch((err) => {
        setCustomLoading(false);
        handleLoader(setCustomLoading, false, 500);
        console.log('error', err);
      });
  };

  const handleStatusChange = (id) => {
    const previousState = checkedState[id];
    const apiData = {
      customer_id: id,
      is_active: !previousState,
    };
    ApiCalling.apiCallPatch(`customer/customer_status`, apiData)
      .then((res) => {
        if (res.data) {
          onDelete();
        } else {
          setCheckedState((prevState) => ({
            ...prevState,
            [id]: previousState,
          }));
          handleLoader(setCustomLoading, false, 500);
        }
        setIsShowDeleteModel(false);
      })
      .catch((err) => {
        console.log('Error', err);
      });
  };

  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell> Name</TableCell>
              <TableCell> Phone</TableCell>
              <TableCell> Email</TableCell>
              <TableCell> Active</TableCell>
              <TableCell> KYC Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {list?.length > 0 ? (
            <TableBody>
              {list?.map((c, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={c.profile_image ? `${s3URL}/${c._id}/${c.profile_image}` : ''}
                        alt={c.first_name}
                      />
                      {c.first_name + ' ' + c.last_name}
                    </TableCell>
                    <TableCell>{c.phone ? c.phone : '-'}</TableCell>
                    <TableCell>{c.email ? c.email : '-'}</TableCell>
                    <TableCell>
                      <Switch
                        sx={{
                          '.MuiButtonBase-root.MuiSwitch-switchBase.Mui-checked:hover,.MuiSwitch-switchBase:hover':
                          {
                            backgroundColor: 'transparent',
                          },
                          '.MuiTouchRipple-root': {
                            display: 'none',
                          },
                        }}
                        checked={!!checkedState[c._id]}
                        onChange={(e) => handleChange(e, c._id)}
                        inputProps={{ 'aria-label': 'controlled' }}
                        disabled={!hasPermission('customer.active')}
                      />
                    </TableCell>
                    <TableCell>
                      {' '}
                      {c.is_kyc_verified ? (
                        <Typography
                          variant="h4"
                          display="flex"
                          alignItems="center"
                          color={success.main}
                        >
                          <VerifiedIcon sx={{ fontSize: 16 }} />
                          &nbsp; Verified
                        </Typography>
                      ) : (
                        <Typography
                          variant="h4"
                          display="flex"
                          alignItems="center"
                          color={error.main}
                        >
                          <NewReleasesIcon sx={{ fontSize: 16 }} />
                          &nbsp; Unverified
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {hasPermission('customer.delete') && (
                        <IconButton
                          onClick={() => {
                            setIsShowDeleteModel(true);
                            setDeleteId(c._id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      <Link className='text-decoration-none' href={(paths.customerDetails(c._id))}>
                        <IconButton>
                          <VisibilityIcon />
                        </IconButton>
                      </Link>
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

      <Dialog
        open={isShowDeleteModel}
        onClose={() => {
          setCustomLoading(false);
          setIsShowDeleteModel(false);
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
            Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="pb-3">Are you sure you want to Delete this Customer?</div>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsShowDeleteModel(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={customLoading}
              variant="soft"
              color="error"
              onClick={handleDeleteCustomer}
            >
              Confirm
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isShowKYCModel}
        onClose={() => {
          setIsShowKYCModel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          {' '}
          <Typography variant="h2">KYC Verification</Typography>
        </DialogTitle>
        <DialogContent>
          <div className=" pb-3">Are you sure you want to mark this Customer as unverified?</div>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsShowKYCModel(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton variant="soft" color="error">
              Confirm
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
