/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */

'use client';

import React, { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import { Grid, CardHeader } from '@mui/material';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import Link from 'next/link';

export default function CustomerCard() {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const [liquidityCustomerList, setLiquidityCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getLiquidityCustomerList = () => {
    ApiCalling.apiCallPost(`customer/customer_list?type=2`)
      .then((res) => {
        if (res.data && res.data.data.length > 0) {
          setLiquidityCustomerList(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
        }
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getLiquidityCustomerList();
  }, []);

  let content;
  switch (true) {
    case loading:
      content = <Loader />;
      break;
    case hasData:
      content = (
        <>
          {liquidityCustomerList.map((l, i) => {
            return (
              <Grid item md={4} lg={3} xs={6} sm={6} key={i}>
                <Link className='text-decoration-none' href={paths.customerLiquidityList(l._id)}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      boxShadow: 'none',
                      height: '100%',
                      border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar
                          src={l?.profile_image ? `${s3URL}/${l?._id}/${l?.profile_image}` : ''}
                          alt={`${l?.first_name} ${l?.last_name}`}
                          aria-label="recipe"
                          sx={{
                            height: 50,
                            width: 50,
                          }}
                        />
                      }
                      title={`${l?.first_name} ${l?.last_name}`}
                      subheader={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {l?.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {`${l?.country_code} ${l?.phone}`}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        mb: 2,
                      }}
                      titleTypographyProps={{
                        sx: {
                          fontSize: '1rem',
                        },
                      }}
                    />
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </>
      );
      break;
    default:
      content = <NoResultFound />;
      break;
  }

  return (
    <div>
      <Grid container spacing={2}>
        {content}
      </Grid>
    </div>
  );
}
