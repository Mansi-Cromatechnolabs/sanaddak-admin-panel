/* eslint-disable no-dupe-keys */
/* eslint-disable react/prop-types */
import * as React from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

export default function VerticalTabs({ a11yProps, value, handleChange, list }) {
  return (
    <div className="vertical-tab-setting">
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
      >
        {list?.map((d, i) => (
          <Tab
            key={i}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
            label={d}
            {...a11yProps(i)}
          />
        ))}
      </Tabs>
    </div>
  );
}
