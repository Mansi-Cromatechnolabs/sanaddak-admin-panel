'use client';

import React, { useState, useEffect } from 'react';

import { Container } from '@mui/system';
import {
  Chip,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const Payment = () => {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const settings = useSettingsContext();

  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPaymentList = () => {
    ApiCalling.apiCallGet('loan_payment_transaction')
      .then((res) => {
        if (res.data) {
          setPaymentList(res.data.data);
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
    getPaymentList();
  }, []);

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
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Payment"
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
              <TableRow sx={{ '& th': { whiteSpace: 'nowrap' } }}>
                <TableCell>#</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Transaction Id</TableCell>
                <TableCell>Liquidity Id </TableCell>

                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment date </TableCell>
              </TableRow>
            </TableHead>

            {paymentList?.length > 0 ? (
              <TableBody>
                {paymentList?.map((payment, i) => {
                  const { label, color } = statusToLabelAndColor(payment.payment_status);
                  return (
                    <TableRow key={i} sx={{ '& td': { whiteSpace: 'nowrap' } }}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={
                            payment.profile_image
                              ? `${s3URL}/${payment.customer_id}/${payment.profile_image}`
                              : ''
                          }
                          alt={payment.full_name}
                        />
                        {payment.full_name}
                      </TableCell>
                      <TableCell>{payment.mobile_number}</TableCell>
                      <TableCell>{payment.transaction_id ? payment.transaction_id : '-'}</TableCell>

                      <TableCell>{payment.liquidate_number}</TableCell>

                      <TableCell>{payment.transaction_amount}</TableCell>
                      <TableCell>
                        <Chip variant="soft" label={label} style={{ borderColor: color, color }} />
                      </TableCell>
                      <TableCell>{globalUTCFormatDate(payment.payment_date)}</TableCell>
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
    </Container>
  );
};

export default Payment;
