import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import { setData } from 'src/redux/dataSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import ValuationCard from 'src/components/sanaddak/Gold-Valuation/ValuationCard';
import { useRouter } from 'next/navigation';

export default function ValuationLiquidity() {
  const dispatch = useDispatch();
  const [valuationList, setValuationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const router = useRouter();
  
  const getValuation = () => {
    setLoading(true);
    ApiCalling.apiCallGet(`gold_loan/valuation_details?valuation_type=pending`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setValuationList(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
        }
      })
      .catch((err) => {
        console.log('error', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getValuation();
  }, []);

  return (
    <Grid container spacing={1}>
      {loading ? (
        <Loader />
      ) : hasData ? (
        <>
          {valuationList?.map((v, i) => {
            return (
              <Grid item xs={6} sm={6} md={6} lg={4} xl={3} key={i}>
                <ValuationCard
                  isApply={hasPermission('liquidityApplicationProcess.liquidityApplicationProcess')}
                  liquidity_amt={v.available_liquidity_to_customer}
                  required_amt={v.customer_cash_needs}
                  gold_karat={v.gold_purity_entered_per_1000}
                  gold_weight={v.gold_weight}
                  tenure={v.tenure}
                  valuation_Id={v.valuation_number}
                  onApplyClick={() => {
                    router.push(paths.loanCalculator);
                    dispatch(setData(v));
                  }}
                />
              </Grid>
            );
          })}
        </>
      ) : (
        <NoResultFound />
      )}
    </Grid>
  );
}
