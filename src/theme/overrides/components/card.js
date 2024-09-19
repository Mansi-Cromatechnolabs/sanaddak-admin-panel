// ----------------------------------------------------------------------

export function card(theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          color: 'black', // theme.palette.text.secondary
          position: 'relative',
          boxShadow: theme.customShadows.card,
          borderRadius: theme.shape.borderRadius * 2,
          zIndex: 0, // Fix Safari overflow: hidden with border radius
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2.5),
        },
      },
    },
  };
}
