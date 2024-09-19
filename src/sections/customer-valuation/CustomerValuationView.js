/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

'use client';

import React, { useState, useEffect } from 'react';

import { Grid } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import CustomerValuationCard from './CustomerValuationCard';
import CustomerCalculatinCard from './CustomerCalculatinCard';

export default function CustomerValuationView({ customerId, appointmentId }) {
  const settings = useSettingsContext();
  const [valuationList, setValuationList] = useState(null);
  const [isUpdatedId, setIsUpdatedId] = useState('');
  const [isCardSelected, setIsCardSelected] = useState('');
  const [loanCalculationData, setLoanCalculationData] = useState({
    liq_id: '',
    req_loan_amt: '',
    weight: '',
    caratage: '',
    tenure: '',
    customer_id: customerId,
    appointment_data: { appointmentId },
    customer: null,
  });
  const getCustomerValuationList = (id) => {
    const apiData = {
      customer_id: customerId,
    };
    ApiCalling.apiCallPost('gold_loan/valuation_list', apiData)
      .then((res) => {
        if (res.data) {
          setValuationList(res.data.data);
          const data = res.data.data?.valuation_list[0];
          if (!id) {
            setLoanCalculationData({
              liq_id: data?.valuation_id,
              req_loan_amt: data?.customer_cash_needs,
              weight: data?.gold_weight,
              caratage: data?.gold_purity_entered_per_1000,
              tenure: data?.tenure,
              customer_id: customerId,
              appointment_data: {
                appointmentId,
                customerId: res.data.data?.customer?.id,
              },
              customer: res.data.data?.customer,
            });
            setIsCardSelected(data?.valuation_id);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAppointmentValuationList = (id) => {
    ApiCalling.apiCallGet(`appointment/valuation_list?appointment_id=${appointmentId}`)
      .then((res) => {
        if (res.data) {
          setValuationList(res.data.data);
          const data = res.data.data?.valuation_list[0];
          if (!id) {
            setLoanCalculationData({
              liq_id: data?.valuation_id,
              req_loan_amt: data?.customer_cash_needs,
              weight: data?.gold_weight,
              caratage: data?.gold_purity_entered_per_1000,
              tenure: data?.tenure,
              customer_id: customerId,
              appointment_data: {
                appointmentId,
                customerId: res.data.data?.customer?.id,
              },
              customer: res.data.data?.customer,
            });
            setIsCardSelected(data?.valuation_id);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (customerId) {
      getCustomerValuationList();
    } else if (appointmentId) {
      getAppointmentValuationList();
    }
  }, [customerId, appointmentId]);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer Valuation"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: customerId ? 'Customer' : appointmentId ? 'List' : '',
              href: customerId ? paths.customer : appointmentId ? paths.appointment : '',
            },
            { name: 'Details' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={8}>
            <CustomerValuationCard
              list={valuationList}
              id={customerId || appointmentId}
              onCardClick={(data, customer) => {
                setLoanCalculationData({
                  customer_id: customerId,
                  liq_id: data.valuation_id,
                  req_loan_amt: data.customer_cash_needs,
                  weight: data.gold_weight,
                  caratage: data.gold_purity_entered_per_1000,
                  tenure: data.tenure,
                  appointment_data: {
                    appointmentId,
                    customerId: customer?.id,
                  },
                  customer,
                });
              }}
              isUpdatedId={isUpdatedId}
              isCardSelected={isCardSelected}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <CustomerCalculatinCard
              loanCalculationData={loanCalculationData}
              onSave={(id) => {
                if (customerId) {
                  setIsUpdatedId(id);
                  getCustomerValuationList();
                } else if (appointmentId) {
                  setIsUpdatedId(id);
                  setIsCardSelected(id);
                  getAppointmentValuationList(id);
                }
              }}
              onAdd={() => {
                setIsCardSelected('');
              }}
              onAddAppointment={(data) => {
                if (data.valuation_id) {
                  setIsCardSelected(data.valuation_id);
                  setLoanCalculationData({
                    liq_id: data?.valuation_id,
                    req_loan_amt: data?.customer_cash_needs,
                    weight: data?.gold_weight,
                    caratage: data?.gold_purity_entered_per_1000,
                    tenure: data?.tenure,
                    customer_id: customerId,
                    appointment_data: {
                      appointmentId,
                      customerId: data?.customer?.id,
                    },
                    customer: data?.customer,
                  });
                  getAppointmentValuationList(data.valuation_id);
                }
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
