import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export default function SplashScreen({ sx, ...other }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        right: 0,
        width: 1,
        bottom: 0,
        height: 1,
        zIndex: 9998,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        ...sx,
      }}
      {...other}
    >
      <m.div
        animate={{
          scale: [1, 0.9, 0.9, 1, 1],
          opacity: [1, 0.48, 0.48, 1, 1],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeatDelay: 1,
          repeat: Infinity,
        }}
      >
        <svg width="75" height="75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g className="loading-animation"><circle fill='#E8BE39' cx="3" cy="12" r="2" /><circle fill='#E8BE38' cx="21" cy="12" r="2" />
            <circle fill='#E8BE39' cx="12" cy="21" r="2" /><circle fill='#E8BE39' cx="12" cy="3" r="2" />
            <circle fill='#E8BE33' cx="5.64" cy="5.64" r="2" /><circle fill='#E8BE39' cx="18.36" cy="18.36" r="2" />
            <circle cx="5.64" fill='#E8BE34' cy="18.36" r="2" /><circle fill='#E8BE39' cx="18.36" cy="5.64" r="2" /></g>
        </svg>
      </m.div>
    </Box>
  );
}

SplashScreen.propTypes = {
  sx: PropTypes.object,
};
