/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Grow,
  Table,
  Button,
  Dialog,
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

import { hasPermission } from 'src/utils/permissionUtils';

export default function UserList({ list, onEdit, onDelete }) {
  const region = process.env.NEXT_PUBLIC_REGION;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const [isShowDeleteModel, setIsShowDeleteModel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const handleDeleteUser = () => {
    setCustomLoading(true);
    setTimeout(() => {
      onDelete(deleteId);
      setIsShowDeleteModel(false);
      setCustomLoading(false);
    }, 2000);
  };

  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell> Name</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Agent Code</TableCell>
              <TableCell> Phone</TableCell>
              <TableCell> Email</TableCell>
              <TableCell> Role</TableCell>
              <TableCell>Store Name</TableCell>
              {(hasPermission('user.update') || hasPermission('user.delete')) && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>

          {list?.length > 0 ? (
            <TableBody>
              {list?.map((c, i) => {
                const url = `https://${bucket}.s3.${region}.amazonaws.com`;
                return (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={c?.profile_image ? `${url}/${c._id}/${c?.profile_image}` : ''}
                        alt={c.first_name.charAt(0).toUpperCase()}
                      />
                      {c.first_name + ' ' + c.last_name}
                    </TableCell>
                    <TableCell>{c.agent_code ? c.agent_code : '-'}</TableCell>

                    <TableCell>{c.mobile_number ? c.mobile_number : '-'}</TableCell>
                    <TableCell>{c.email ? c.email : '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.role_name.join(',')}</TableCell>
                    <TableCell>{c.branch_name ? c.branch_name : '-'}</TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {hasPermission('user.update') && (
                        <IconButton
                          onClick={() => {
                            onEdit(c);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {hasPermission('user.delete') && (
                        <>
                          {!c.not_deletable && (
                            <IconButton
                              onClick={() => {
                                setIsShowDeleteModel(true);
                                setDeleteId(c._id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </>
                      )}
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
          setIsShowDeleteModel(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            Delete User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className=" pb-3">Are you sure you want to delete this User?</div>

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
              variant="soft"
              color="error"
              loading={customLoading}
              onClick={() => {
                handleDeleteUser();
              }}
            >
              Delete
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
