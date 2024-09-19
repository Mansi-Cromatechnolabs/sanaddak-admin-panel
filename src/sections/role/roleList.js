'use client';

/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Grow,
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  DialogTitle,
  TableFooter,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import Link from 'next/link';

export default function RoleList({ list, onDelete }) {
  const [isShowDeleteModel, setIsShowDeleteModel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const handleDeleteRole = () => {
    setCustomLoading(true);
    ApiCalling.apiCallDelete(`tanant/role/delete/${deleteId}`)
      .then((res) => {
        if (res.data) {
          setTimeout(() => {
            setIsShowDeleteModel(false);
            onDelete();
            ToasteMessage(res?.data.message, 'success');
            setCustomLoading(false);
          }, 2000);
        } else {
          handleLoader(setCustomLoading, false, 500);
          console.log('error');
        }
      })
      .catch((error) => {
        console.error(error);
        handleLoader(setCustomLoading, false, 500);
      });
  };
  const router = useRouter();
  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              {(hasPermission('role&Permissions.update') ||
                hasPermission('role&Permissions.delete')) && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {list?.length > 0 ? (
            <TableBody>
              {list.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{d.name} </TableCell>
                  <TableCell
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    <Link className='text-decoration-none' style={{ color: "#161C24" }} href={paths.editRole(d.id)}>
                      view permissions
                    </Link>
                  </TableCell>

                  {(hasPermission('role&Permissions.update') ||
                    hasPermission('role&Permissions.delete')) && (
                      <TableCell>
                        {hasPermission('role&Permissions.update') && !d.not_deletable && (
                          <Link className='text-decoration-none' href={paths.editRole(d.id)}>
                            <IconButton>
                              <EditIcon />
                            </IconButton>
                          </Link>
                        )}
                        {hasPermission('role&Permissions.delete') && !d.not_deletable && (
                          <IconButton
                            onClick={() => {
                              setIsShowDeleteModel(true);
                              setDeleteId(d.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
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
          <Typography fontSize={16} fontWeight={600}>Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="p">Are you sure you want to delete this Role?</Typography>
        </DialogContent>
        <DialogActions>
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
              handleDeleteRole();
            }}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
