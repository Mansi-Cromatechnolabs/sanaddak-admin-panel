import { accordionClasses } from '@mui/material/Accordion';
import { typographyClasses } from '@mui/material/Typography';
import { accordionSummaryClasses } from '@mui/material/AccordionSummary';

// ----------------------------------------------------------------------

export function accordion(theme) {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          color: theme.palette.common.black,
          border: '1px solid',
          borderColor: theme.palette.text.lightGrey,
          // backgroundColor: 'transparent',
          [`&.${accordionClasses.expanded}`]: {
            boxShadow: 'none',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: 'transparent',
          },
          [`&.${accordionClasses.disabled}`]: {
            // backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1),
          [`&.${accordionSummaryClasses.disabled}`]: {
            opacity: 1,
            color: theme.palette.action.disabled,
            [`& .${typographyClasses.root}`]: {
              color: 'inherit',
            },
          },
        },
        expandIconWrapper: {
          // color: 'inherit',
        },
      },
    },
  };
}
