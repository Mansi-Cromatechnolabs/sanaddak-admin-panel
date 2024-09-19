'use client';

import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import { Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { setData } from 'src/redux/dataSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { AppointmentStatus } from 'src/ENUMS/enums';
import { setAppointmentType } from 'src/redux/appointmentTypeSlice';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';

import BookedAppointmentCard from './BookedAppointmentCard';
import { useRouter } from 'next/navigation';

export default function AppointmentList({ isBooked }) {
  const dispatch = useDispatch();
  const [appointmentList, setAppointmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const router = useRouter();

  const getAppointmentList = () => {
    ApiCalling.apiCallGet('appointment')
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setAppointmentList(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
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
    getAppointmentList();
  }, [isBooked]);

  return (
    <Box
      sx={{
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => theme.palette.grey[500],
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: (theme) => theme.palette.primary.dark,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: (theme) => theme.palette.grey[300],
          borderRadius: '8px',
        },
      }}
    >
      <Grid container spacing={2}>
        {loading ? (
          <Loader />
        ) : hasData ? (
          <>
            {appointmentList?.map((d, i) => {
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <BookedAppointmentCard
                    onCardClick={() => {
                      if (d.appointment_type === AppointmentStatus.VALUATION) {
                        if (d.valuation_id.length === 0) {
                          const data = {
                            customer_id: d.customer.id,
                            valuation_id: null,
                            customer_cash_needs: '',
                            gold_weight: '',
                            gold_purity_entered_per_1000: '',
                            tenure: '',
                            appointment_id: d.appointment_id,
                          };
                          router.push(paths.loanCalculator);
                          dispatch(setData(data));
                        } else {
                          router.push(paths.appointmentDetails(d.appointment_id));
                        }
                      } else {
                        router.push(paths.liquidityPorfolioDetails(d.liquidity_id));
                        dispatch(setAppointmentType(d.appointment_type));
                      }
                    }}
                    data={d}
                  />
                </Grid>
              );
            })}
          </>
        ) : (
          <NoResultFound />
        )}
      </Grid>
    </Box>
  );
}
