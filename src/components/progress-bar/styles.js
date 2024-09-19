import GlobalStyles from '@mui/material/GlobalStyles';

import { golden } from 'src/theme/palette';

// ----------------------------------------------------------------------

export default function StyledProgressBar() {

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        '#nprogress': {
          pointerEvents: 'none',
          '.bar': {
            top: 0,
            left: 0,
            height: 2.5,
            zIndex: 9999,
            width: '100%',
            position: 'fixed',
            backgroundColor: golden.default,
            boxShadow: `0 0 2px ${golden.default}`,
          },
          '.peg': {
            right: 0,
            opacity: 1,
            width: 100,
            height: '100%',
            display: 'block',
            position: 'absolute',
            transform: 'rotate(3deg) translate(0px, -4px)',
            boxShadow: `0 0 10px ${golden.default}, 0 0 5px ${golden.default}`,
          },
        },
      }}
    />
  );

  return inputGlobalStyles;
}
