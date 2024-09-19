/* eslint-disable react/prop-types */

'use client';

import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import KYCTabs from './KYCTabs';
import DateTabs from './DateTabs';
import VerticalTabs from './verticalTabs';
import TagPriceConfig from './TagPriceConfig';
import AppointmentTabs from './AppointmentTabs';
import LockTheRateTabs from './LockTheRateTabs';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: '85%' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 1, m: 1, mt: 0, pt: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function GlobalConfigTab() {
  const settings = useSettingsContext();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [data, setData] = useState([]);

  const getConfigData = () => {
    ApiCalling.apiCallPost(`global_config`)
      .then((res) => {
        if (res.data) {
          setData(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const dataType = data.map((item) => item.type);
  const dataTypesFilter = dataType
    .filter((item, index) => dataType.indexOf(item) === index)
    .filter((item) => item !== 'tenure' && item !== 'twillo');

  const selectTabsType = dataTypesFilter[value];
  const filteredValues = data
    .filter((item) => item.type === selectTabsType)
    .map((item) => item.value);

  const filteredData = data.filter((item) => item.type === selectTabsType).map((item) => item);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Global Configurations"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Types' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
        <VerticalTabs
          handleChange={handleChange}
          value={value}
          setValue={setValue}
          a11yProps={a11yProps}
          TabPanel={TabPanel}
          list={dataTypesFilter}
        />
        {dataTypesFilter.map((type, index) => (
          <TabPanel key={type} value={value} index={index}>
            {type === 'appointment' && (
              <AppointmentTabs filteredValues={filteredValues} getConfigData={getConfigData} />
            )}
            {type === 'date' && (
              <DateTabs filteredValues={filteredValues} getConfigData={getConfigData} />
            )}

            {type === 'Lock the rate' && (
              <LockTheRateTabs filteredValues={filteredValues} getConfigData={getConfigData} />
            )}
            {type === 'Tag price config' && (
              <TagPriceConfig filteredValues={filteredData} getConfigData={getConfigData} />
            )}
            {type === 'KYC' && (
              <KYCTabs filteredValues={filteredData} getConfigData={getConfigData} />
            )}
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
}
