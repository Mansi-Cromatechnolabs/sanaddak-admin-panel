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

export default function MessageList({ list, onEdit }) {
  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Message Templates</TableCell>
              <TableCell>Date</TableCell>

              {(hasPermission('messageTemplate.update') ||
                hasPermission('messageTemplate.view')) && (
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
                  {(hasPermission('messageTemplate.update') ||
                    hasPermission('messageTemplate.view')) && (
                    <TableCell align="center">
                      {hasPermission('messageTemplate.update') && (
                        <IconButton
                          onClick={() => {
                            onEdit(d);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {hasPermission('messageTemplate.view') && (
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
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
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
