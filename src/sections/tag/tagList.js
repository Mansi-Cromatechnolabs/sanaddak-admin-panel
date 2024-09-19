import React, { useState } from 'react';

import { Box } from '@mui/system';
import Grow from '@mui/material/Grow';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import {
  Chip,
  Card,
  Table,
  Paper,
  Button,
  Avatar,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableFooter,
  CardContent,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { PriceTagStatus, UserRolePermission } from 'src/ENUMS/enums';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import Link from 'next/link';

export default function TagList({
  list,
  onEdit,
  onDelete,
  isShowDeleteModel,
  setIsShowDeleteModel,
  onDeleteClose,
}) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const [deleteId, setDeleteId] = useState(null);
  const [isHistoryModel, setIsHistoryModel] = useState(false);
  const [historyDetails, setHistoryDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);

  const Tagstatus = (status, isDefault) => {
    if (status === '' && isDefault) {
      return { label: 'Active', color: 'success' };
    } else if (status === '' && !isDefault) {
      return { label: 'Inactive', color: 'error' };
    }
    switch (status) {
      case PriceTagStatus.DEFAULT_TAG:
        return { label: 'Active', color: 'success' };
      case PriceTagStatus.REQUESTED_FOR_VERIFICATION:
        return { label: 'Requested for verification', color: 'secondary' };
      case PriceTagStatus.REQUESTED_FOR_APPROVAL:
        return { label: 'Requested for approval', color: 'warning' };
      case PriceTagStatus.APPROVED:
        return { label: 'Approved', color: 'success' };

      default:
        return { label: 'Inactive', color: 'error' };
    }
  };

  const handleHistory = (id) => {
    ApiCalling.apiCallGet(`gold_loan/price_config_log?tag_id=${id}`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setIsHistoryModel(true);
          setHistoryDetails(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteTag = () => {
    setCustomLoading(true);
    setTimeout(() => {
      onDelete(deleteId);
      setCustomLoading(false);
    }, 2000);
  };

  const roleStatus = (status) => {
    switch (status) {
      case UserRolePermission.MAKER:
        return 'Maker';
      case UserRolePermission.CHECKER:
        return 'Checker';
      case UserRolePermission.APPROVER:
        return 'Approver';
      default:
        return '';
    }
  };

  return (
    <>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          {list.length > 0 ? (
            <TableBody>
              {list.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{d.name} </TableCell>
                  <TableCell>{d.description ? d.description : '-'} </TableCell>
                  <TableCell>{globalUTCFormatDate(d.create_date)} </TableCell>
                  <TableCell>
                    <Chip
                      label={Tagstatus(d.status, d.is_default)?.label}
                      variant="soft"
                      color={Tagstatus(d.status, d.is_default)?.color}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Tooltip title="Price Details">
                      <Link className='text-decoration-none' href={paths.configuration.priceTag(d._id)}>
                        <IconButton>
                          <CurrencyPoundIcon />
                        </IconButton>
                      </Link>
                    </Tooltip>

                    {d.status !== '' && (
                      <Tooltip title="History">
                        <IconButton onClick={() => handleHistory(d._id)}>
                          <ManageHistoryIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!d.is_default && (
                      <>
                        {hasPermission('priceTag.maker') && (
                          <IconButton
                            onClick={() => {
                              onEdit(d);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {hasPermission('priceTag.delete') && (
                          <IconButton
                            onClick={() => {
                              setIsShowDeleteModel(true);
                              setDeleteId(d._id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
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
          setIsShowDeleteModel(false);
          onDeleteClose();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            Delete
          </Typography>
        </DialogTitle>

        <DialogContent>
          <div className="pb-3">Are you sure you want to delete this tag?</div>

          <div className="d-flex justify-content-end align-items-center pb-3 gap-2">
            <Button
              variant="text"
              onClick={() => {
                setIsShowDeleteModel(false);
                onDeleteClose();
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="soft"
              color="error"
              loading={customLoading}
              onClick={() => {
                handleDeleteTag();
              }}
            >
              Delete
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isHistoryModel}
        fullWidth
        maxWidth="md"
        onClose={() => {
          setIsHistoryModel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        TransitionProps={{
          onEntered: () => { },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography
            fontSize={16}
            fontWeight={600}
            mb={2}
            className="d-flex align-items-center justify-space-between"
          >
            History
            <Button
              onClick={() => {
                setIsHistoryModel(false);
              }}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ marginBottom: 3 }}>
          {loading ? (
            <Loader />
          ) : hasData ? (
            <>
              {historyDetails?.map((d, i) => {
                return (
                  <Card
                    key={i}
                    sx={{
                      boxShadow: 'none',
                      border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                      mb: 1,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: '', mb: 2 }}>
                        <Avatar
                          src={
                            d?.user_details?.profile_image
                              ? `${s3URL}/${d?.user_details?._id}/${d?.user_details?.profile_image}`
                              : ''
                          }
                          alt={d?.user_details?.full_name}
                          sx={{ width: 45, height: 45, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h3">{d?.user_details?.full_name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {d?.user_details?.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {roleStatus(d?.user_role_permission)}
                          </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2">
                          Date: {globalUTCFormatDate(d.config_update_date)}
                        </Typography>
                      </Box>

                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Gold Price</TableCell>
                              <TableCell>Reserve Rate</TableCell>
                              <TableCell>Margin Rate</TableCell>
                              <TableCell>Admin Renewal Rate</TableCell>
                              <TableCell>Admin Rate</TableCell>
                              <TableCell>Penalty Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>{d?.requested_gold_price || '-'}</TableCell>
                              <TableCell>{d?.reserve_rate || '-'}</TableCell>
                              <TableCell>{d?.margin_rate || '-'}</TableCell>
                              <TableCell>{d?.admin_fee_rate_renewal || '-'}</TableCell>
                              <TableCell>{d?.admin_fee_rate || '-'}</TableCell>
                              <TableCell>{d?.penalty_rate || '-'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            <NoResultFound />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
