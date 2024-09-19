/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';

import { Box } from '@mui/system';
import { TabList, TabPanel, TabContext } from '@mui/lab';
import { Tab, Card, Grid, Typography, CardContent } from '@mui/material';

import ValuationCard from './ValuationCard/ValuationCard';
import LiquidityCard from './LiquidityCard/LiquidityCard';

export default function CustomerTabCard({ liquidityData, valuationsData }) {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {}, [liquidityData, valuationsData]);

  const hasLiquidityData = liquidityData?.length > 0;
  const hasValuationsData = valuationsData?.length > 0;
  return (
    <div className="h-100">
      <Card
        sx={{
          mx: 'auto',
          borderRadius: 3,
          boxShadow: 3,
          display: 'flex',
          alignItems: 'start',
          height: '100%',
        }}
      >
        <CardContent
          sx={{
            textAlign: 'center',
            width: '100%',
          }}
        >
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
              <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Valuation" value="1" />
                <Tab label="Liquidity" value="2" />
              </TabList>
            </Box>
            <TabPanel
              value="1"
              sx={{
                px: 1,
                maxHeight: 438,
                overflow: 'auto',
              }}
            >
              {hasValuationsData ? (
                <Grid container spacing={2}>
                  {valuationsData?.map((valuation, index) => (
                    <Grid key={index} item sm={6} lg={4}>
                      <ValuationCard valuation={valuation} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="h3">No Data Found</Typography>
              )}
            </TabPanel>
            <TabPanel
              value="2"
              sx={{
                px: 1,
                maxHeight: 438,
                overflow: 'auto',
              }}
            >
              {hasLiquidityData ? (
                <Grid container spacing={2}>
                  {liquidityData?.map((liquidity, index) => (
                    <Grid key={index} item md={6} sm={12}>
                      <LiquidityCard liquidity={liquidity} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="h3">No Data Found</Typography>
              )}
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
    </div>
  );
}
