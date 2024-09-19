/* eslint-disable react/prop-types */
import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';
import { globalUTCFormatDate } from 'src/utils/dateFormatter';

export default function NotificationList({ list, onEdit }) {
  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Notification Templates</TableCell>
              <TableCell>Date</TableCell>

              {(hasPermission('notificationTemplate.update') ||
                hasPermission('notificationTemplate.view')) && (
                <TableCell align="center">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          {list.length > 0 ? (
            <TableBody>
              {list.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{d.name} </TableCell>
                  <TableCell>{globalUTCFormatDate(d.created_date)} </TableCell>
                  {(hasPermission('notificationTemplate.update') ||
                    hasPermission('notificationTemplate.view')) && (
                    <TableCell align="center">
                      {hasPermission('notificationTemplate.update') && (
                        <IconButton
                          onClick={() => {
                            onEdit(d);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {hasPermission('notificationTemplate.view') && (
                        <IconButton
                          onClick={() => {
                            onEdit(d);
                          }}
                        >
                          <RemoveRedEyeIcon />
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
                <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                  No Data Found
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </div>
  );
}
