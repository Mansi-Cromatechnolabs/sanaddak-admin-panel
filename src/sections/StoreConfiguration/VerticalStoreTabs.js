/* eslint-disable react/prop-types */
import * as React from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

export default function VerticalStoreTabs({ a11yProps, value, handleChange, list }) {
  return (
    <div className="vertical-tab-setting">
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{maxWidth: 200, minWidth: 150}}
      >
        {list?.map((d, i) => (
          <Tab
            key={i}
            sx={{ justifyContent: 'flex-start', textTransform: 'none',  fontSize: {lg:14}, textAlign: 'left', whiteSpace:{lg: "nowrap"}}}
            label={d.type}
            {...a11yProps(i)}
          />
        ))}
      </Tabs>
    </div>
  );
}
