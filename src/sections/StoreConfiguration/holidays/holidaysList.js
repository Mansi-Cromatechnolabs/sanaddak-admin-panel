/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import Grow from '@mui/material/Grow';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';

export default function HolidaysList({ list, onEdit, onDelete }) {
  const [isShowDeleteModel, setIsShowDeleteModel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const handleDeleteHolidays = () => {
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
              <TableCell>Holidays</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          {list.length > 0 ? (
            <TableBody>
              {list.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{d.name} </TableCell>
                  <TableCell>{globalUTCFormatDate(d.holiday_date)} </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        onEdit(d);
                      }}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => {
                        setIsShowDeleteModel(true);
                        setDeleteId(d._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
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
          <Typography fontWeight={600} fontSize={16}>
            Delete Holiday
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className=" pb-3">Are you sure you want to delete this Holiday?</div>

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
                handleDeleteHolidays();
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
