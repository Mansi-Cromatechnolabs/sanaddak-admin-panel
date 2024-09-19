// ----------------------------------------------------------------------

export function typography(theme) {
  return {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary,
        },
        paragraph: {
          marginBottom: theme.spacing(2),
        },
        gutterBottom: {
          marginBottom: theme.spacing(1),
        },
        h6: {
          // color: theme.palette.text.secondary, // Change the color to your desired color
        },
      },
    },
  };
}
