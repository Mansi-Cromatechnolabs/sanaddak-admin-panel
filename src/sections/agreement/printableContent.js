/* eslint-disable react/prop-types */
import React, { forwardRef } from 'react';

import { Box } from '@mui/system';
import { Typography } from '@mui/material';

export const PrintableContent = forwardRef(({ agreements }, ref) => (
  <div ref={ref}>
    {agreements.map((agreement) => (
      <Box key={agreement._id} style={{ pageBreakAfter: 'always' }} padding={5}>
        <Typography variant="h1" textAlign="center" mb={2}>
          {agreement.name}
        </Typography>
        <Typography dangerouslySetInnerHTML={{ __html: agreement.body }} />
      </Box>
    ))}
  </div>
));
