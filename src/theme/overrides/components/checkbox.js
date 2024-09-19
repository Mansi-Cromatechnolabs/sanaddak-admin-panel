import { checkboxClasses } from '@mui/material/Checkbox';

// ----------------------------------------------------------------------

export function checkbox(theme) {
  return {
    MuiCheckbox: {
      styleOverrides: {
        root: ({ ownerState }) => {
          const { color } = ownerState;

          return {
            padding: theme.spacing(1),
            // ...(color === 'default' && {
            [`&.${checkboxClasses.checked}`]: {
              color: theme.palette.primary.light,
              // color: theme.palette.text.primary,
            },
            // }),
            [`&.${checkboxClasses.disabled}`]: {
              color: theme.palette.action.disabled,
            },
          };
        },
      },
    },
  };
}
