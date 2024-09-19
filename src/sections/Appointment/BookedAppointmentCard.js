'use client';

import React from 'react';
import { Ribbon } from 'react-ribbons';

import { Card, Grid, Avatar, Typography } from '@mui/material';

import { AppointmentStatus } from 'src/ENUMS/enums';

import ClockIcon from '../../../public/assets/images/general/clock-icon.svg';

export default function BookedAppointmentCard({ onCardClick, data }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });

    return `${day} ${month}`;
  };
  const today = new Date().setHours(0, 0, 0, 0);
  const bookingDate = new Date(data.booking_date).setHours(0, 0, 0, 0);
  const isDisabled = bookingDate < today || data.is_branch_visited;

  const appointmentStatus = (status) => {
    switch (status) {
      case AppointmentStatus.BUYBACK:
        return { label: 'Buyback', color: '#c5f7dc' };
      case AppointmentStatus.EXTEND:
        return { label: 'Extend', color: '#CDE2FF' };
      case AppointmentStatus.LIQUIDATE:
        return { label: 'Liquidate', color: '#FFE8C3' };

      default:
        return { label: '', color: '' };
    }
  };
  return (
    <Card
      sx={{
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
        width: '100%',
        p: 1,
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
      className="cursor-pointer h-100 d-flex align-items-center"
      onClick={!isDisabled ? onCardClick : undefined}
    >
      {data.appointment_type !== AppointmentStatus.VALUATION && (
        <Ribbon
          side="left"
          type="corner"
          size="large"
          backgroundColor={appointmentStatus(data.appointment_type)?.color}
          color={'#000'}
          fontFamily="calibri"
          withStripes
        >
          {appointmentStatus(data.appointment_type)?.label}
        </Ribbon>
      )}
      <Grid container>
        <Grid
          item
          xs={3}
          pr={3}
          sx={{
            borderRight: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            className="text-capitalize"
            variant="h3"
            color={(theme) => theme.palette.text.primary}
          >
            {data?.day?.slice(0, 3)}
          </Typography>
          <Typography className="text-12 text-nowrap" color={(theme) => theme.palette.text.gray500}>
            {formatDate(data.booking_date)}
          </Typography>
        </Grid>
        <Grid item xs={9} p={2}>
          <Grid container flexWrap="nowrap" spacing={2}>
            <Grid item>
              <Avatar
                src={
                  data?.customer?.profile_image
                    ? `${s3URL}/${data?.customer?.id}/${data?.customer?.profile_image}`
                    : ''
                }
                alt={data?.customer?.full_name}
                aria-label="Customer Avatar"
                sx={{ width: 40, height: 40 }}
              />
            </Grid>
            <Grid item>
              <Typography variant="h3">{data?.customer?.full_name}</Typography>
              <Typography variant="h6" color="textSecondary">
                {data?.customer?.firstname}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {data?.customer?.phone}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {data?.customer?.email}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="h4" mt={1}>
            ID : {data?.booking_number}
          </Typography>
          {data.appointment_type === AppointmentStatus.VALUATION && (
            <Typography variant="h5">{data.valuation_id.length} Liquidity Valuations</Typography>
          )}
          {data.appointment_start_time && (
            <Grid container alignItems="center" flexWrap={'nowrap'} spacing={1}>
              <Grid item>
                <ClockIcon />
              </Grid>
              <Grid item>
                <Typography className="text-12" color={(theme) => theme.palette.text.gray500}>
                  {data.appointment_start_time} - {data.appointment_end_time}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
