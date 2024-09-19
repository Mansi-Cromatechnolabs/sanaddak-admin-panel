/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unescaped-entities */
import * as Yup from 'yup';
import { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import {
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { setData } from 'src/redux/dataSlice';
import ApiCalling from 'src/ApiCalling/ApiCalling';
import { AppointmentStatus } from 'src/ENUMS/enums';
import { setAppointmentType } from 'src/redux/appointmentTypeSlice';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

// ----------------------------------------------------------------------

function Searchbar() {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const router = useRouter();
  const SearchSchema = Yup.object().shape({
    // search: Yup.string().required('OTP is required').length(6, 'OTP must be exactly 6 digits'),
  });

  const defaultValues = {
    search: '',
  };

  const methods = useForm({
    resolver: yupResolver(SearchSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    const searchQuery = data.search.trim().toUpperCase(); // Convert to lowercase and trim whitespace

    ApiCalling.apiCallGet(`loan/global_search?id=${searchQuery}`)
      .then((res) => {
        const { id } = res.data.data;
        if (res?.data?.data?.id === null) {
          handleDialogOpen(); // Open the popover
        } else if (searchQuery.startsWith('VA')) {
          router.push(paths.loanCalculator);
          dispatch(setData(res.data.data));
        } else {
          if (searchQuery.startsWith('LI')) {
            router.push(paths.liquidityPorfolioDetails(id));
          } else if (searchQuery.startsWith('AP')) {
            if (res.data.data.appointment_type === AppointmentStatus.VALUATION) {
              router.push(paths.appointmentDetails(id));
            } else {
              router.push(paths.liquidityPorfolioDetails(res?.data?.data?.liquidity_id));
              dispatch(setAppointmentType(res.data.data.appointment_type));
            }
          } else if (/^\d+$/.test(searchQuery)) {
            router.push(paths.customerDetails(id));
          } else {
            // console.log('No match found');
          }
          reset();
          // Handle case when id is not null (e.g., proceed with other logic)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const renderButton = (
    <Stack direction="row" alignItems="center">
      <RHFTextField
        aria-describedby="simple-poover"
        name="search"
        label="Search..."
        sx={{ width: { md: 400, sm: 250 } }}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{ cursor: 'pointer' }}
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      {/* {lgUp && <Label sx={{ px: 0.75, fontSize: 12, color: 'text.secondary' }}>⌘K</Label>} */}
    </Stack>
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderButton}
      </FormProvider>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="no-results-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="no-results-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            No Results Found
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            We couldn' t find any results for your query. Please try again with a different search
            term.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="no-results-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="no-results-dialog-title">
          <Typography fontWeight={600} fontSize={16}>
            No Results Found
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            We couldn' t find any results for your query. Please try again with a different search
            term.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlebClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 400, // Use the width of the container
          },
        }}
      >
        

        <Scrollbar sx={{ p: 3, pt: 2, height: 400 }}>
          {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderItems()}
        </Scrollbar>
      </Popover>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            mt: 15,
            overflow: 'unset',
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: 'flex-start',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{
              sx: { typography: 'h6' },
            }}
          />
        </Box>

        <Scrollbar sx={{ p: 3, pt: 2, height: 400 }}>
          {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderItems()}
        </Scrollbar>
      </Dialog> */}
    </>
  );
}

export default memo(Searchbar);
