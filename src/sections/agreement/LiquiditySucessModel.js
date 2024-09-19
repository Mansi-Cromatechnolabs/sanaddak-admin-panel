/* eslint-disable react/prop-types */
import React from 'react';
import { useRouter } from 'next/navigation';

import { Box } from '@mui/system';
import { Close } from '@mui/icons-material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { Grow, Grid, Dialog, Button, Typography, DialogContent } from '@mui/material';

import { paths } from 'src/routes/paths';

import { globalUTCFormatDate, convertDateToTimeFormat } from 'src/utils/dateFormatter';

export default function LiquiditySucessModel({ open, onClose, data, title }) {
  const router = useRouter();
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionComponent={Grow}
      >
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding={2}
            marginBottom={2}
            position="relative"
          >
            <Button
              onClick={() => {
                router.push(paths.dashboard.root);
                onClose();
              }}
              sx={{
                width: 28,
                height: 28,
                position: 'absolute',
                right: 0,
              }}
            >
              <Close />
            </Button>
            <CheckCircleOutlinedIcon sx={{ fontSize: 60, marginBottom: 1, color: '#BE7509' }} />
            <Typography variant="h1">{title}</Typography>
            <Typography variant="h6">
              Liquidity Application Process successfully completed.
            </Typography>

            <Typography variant="h3" m={3}>
              {globalUTCFormatDate(data?.agreement_uploaded_date)} ,{' '}
              {convertDateToTimeFormat(data?.agreement_uploaded_date)}
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Liquidity ID
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {data?.liquidate_number}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Name
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {data?.customer_full_name}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Email
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {data?.customer_email}
              </Grid>
              <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                Mobile No.
              </Grid>
              <Grid item xs={6} textAlign="end" fontWeight={600}>
                {data?.customer_mobile_number}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
