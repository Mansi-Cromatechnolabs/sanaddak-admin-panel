/* eslint-disable react/prop-types */
import React from 'react';

import Chip from '@mui/material/Chip';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';

export default function PaymentInfo({ data }) {
  const statusToLabelAndColor = (status) => {
    switch (status) {
      case 'credited':
        return { label: 'Debited', borderColor: '#d3eaff', color: '#6192b6' };

      case 'debited':
        return { label: 'Credited', borderColor: '#c5f7dc', color: '#3ac279' };

      default:
        return { label: '', color: '#000000' };
    }
  };
  return (
    <div className="mb-4">
      <Typography variant="h3" color={(theme) => theme.palette.text.primary} mb={1.5}>
        Payment Summary
      </Typography>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Transaction id</TableCell>
              <TableCell>Liquidity id</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Payment Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          {data?.length > 0 ? (
            <TableBody>
              {data?.map((p, i) => {
                const { label, color } = statusToLabelAndColor(p.payment_status);
                return (
                  <TableRow key={i}>
                    <TableCell>{p.transaction_id ? p.transaction_id : 'tr214627hghg'}</TableCell>
                    <TableCell>{p.liquidate_number}</TableCell>
                    <TableCell>{globalUTCFormatDate(p.payment_date)}</TableCell>
                    <TableCell>{p.transaction_amount}</TableCell>
                    <TableCell>
                      {p.emi_number === 0 ? 'Disbursed Liquidity' : `installment ${p.emi_number}`}
                    </TableCell>
                    <TableCell>
                      <Chip variant="soft" label={label} style={{ borderColor: color, color }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          ) : (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
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
