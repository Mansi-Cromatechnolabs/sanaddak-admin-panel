import React from 'react';

import { Box } from '@mui/system';
import { Close } from '@mui/icons-material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { Grow, Grid, Dialog, Button, Typography, DialogContent } from '@mui/material';

import { globalUTCFormatDate, convertDateToTimeFormat } from 'src/utils/dateFormatter';

export default function ApprovedSuceessModel({ open, onClose, data }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          padding={3}
          position="relative"
        >
          <Button
            onClick={onClose}
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
          <Typography variant="h1">All done!</Typography>
          <Typography variant="h6">
            Liquidity Disbursement Process successfully completed.
          </Typography>

          <Typography variant="h3" m={3}>
            {globalUTCFormatDate(data?.verification_date)},{' '}
            {convertDateToTimeFormat(data?.verification_date)}
          </Typography>

          <Grid container spacing={1}>
            <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
              Liquidity ID
            </Grid>
            <Grid item xs={6} textAlign="end" fontWeight={600}>
              {data?.liquidity_id || '-'}
            </Grid>
            <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
              Transaction ID
            </Grid>
            <Grid item xs={6} textAlign="end" fontWeight={600}>
              {data?.transaction_id || '-'}
            </Grid>
            <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
              Verifier Name
            </Grid>
            <Grid item xs={6} textAlign="end" fontWeight={600}>
              {data?.verifier_name || '-'}
            </Grid>
            <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
              Email
            </Grid>
            <Grid item xs={6} textAlign="end" fontWeight={600}>
              {data?.verifier_email || '-'}
            </Grid>
            <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
              Mobile No.
            </Grid>
            <Grid item xs={6} textAlign="end" fontWeight={600}>
              {data?.verifier_phone || '-'}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
