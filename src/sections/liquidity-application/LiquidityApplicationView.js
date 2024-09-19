/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React from 'react';

import { Tab } from '@mui/material';
import { Box, Container } from '@mui/system';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AppliedLiquidity from './AppliedLiquidity';
import ValuationLiquidity from './ValuationLiquidity';

export default function LiquidityApplicationView() {
  const [value, setValue] = React.useState('1');

  const settings = useSettingsContext();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liquidity Application"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Application" value="1" />
              <Tab label=" Gold valuation" value="2" />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <AppliedLiquidity />
          </TabPanel>
          <TabPanel
            value="2"
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <ValuationLiquidity />
          </TabPanel>
        </TabContext>
      </Container>
    </div>
  );
}
