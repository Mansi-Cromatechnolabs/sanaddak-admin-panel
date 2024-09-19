/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import {
  Card,
  Grid,
  List,
  Paper,
  Avatar,
  Drawer,
  Button,
  ListItem,
  CardHeader,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';

import Image from 'src/components/image';

export default function CustomerValuation({ drawerOpen, handleDrawerClose, data, onConfirmClick }) {
  const [customLoading, setCustomLoading] = useState(false);
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;

  // eslint-disable-next-line react/no-unstable-nested-components
  const SubheaderWithAdditional = () => (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {data?.customer?.phone}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {data?.customer?.email && data?.customer?.email}
      </Typography>
    </Box>
  );
  const TitleWithAdditional = () => (
    <Box>
      <Typography variant="h6"> {data?.customer?.full_name}</Typography>
    </Box>
  );
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
      <Box
        sx={{ width: 500, padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
        role="presentation"
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <Typography
            variant="h2"
            mb={2}
            className="d-flex align-items-center justify-space-between"
          >
            Customer Valuation
            <Button
              onClick={handleDrawerClose}
              sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
            >
              <Close />
            </Button>
          </Typography>
          <Card className="mt-2">
            <CardHeader
              avatar={
                <Avatar
                  src={
                    data?.customer?.profile_image
                      ? `${s3URL}/${data?.customer?._id}/${data?.customer?.profile_image}`
                      : ''
                  }
                  alt={data?.customer?.full_name}
                  aria-label="recipe"
                  sx={{ width: 56, height: 56 }}
                />
              }
              title={<TitleWithAdditional />}
              subheader={<SubheaderWithAdditional />}
              titleTypographyProps={{
                sx: {
                  fontSize: '1rem',
                },
              }}
              subheaderTypographyProps={{
                sx: {
                  marginTop: 0,
                },
              }}
              sx={{
                marginBottom: 2,
              }}
            />
          </Card>
          <Card className="mt-2">
            <CardContent>
              <Grid container spacing={1} mb={1}>
                <Grid item sm={6}>
                  <Paper
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                      padding: 2,
                    }}
                  >
                    <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.gray500}>
                      Total Valuation
                    </Typography>

                    <Typography variant="h1"> {data?.gold_piece_value}</Typography>
                  </Paper>
                </Grid>
                <Grid item sm={6}>
                  <Paper
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
                      padding: 2,
                    }}
                  >
                    <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.gray500}>
                      Available Liquidity
                    </Typography>
                    <Typography variant="h1"> {data?.available_liquidity_to_customer}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card className="mt-2">
            <CardContent>
              <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.gray500}>
                Available Liquidity
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  weight(in gram)
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}> {data?.gold_weight}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Karat
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}>{data?.gold_purity_entered_per_1000}</Typography>
                </Grid>

                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Verification & Storage fee
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}> {data?.admin_fee}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Total margin
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}> {data?.margin}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Tenure
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}>{data?.tenure}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Installment
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}>{data?.installment}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Buyback Amount
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}> {data?.buyback_amount}</Typography>
                </Grid>
                <Grid item xs={6} color={(theme) => theme.palette.text.gray500}>
                  Net liquidate cash after fees
                </Grid>
                <Grid item xs={6} textAlign="end">
                  <Typography fontWeight={700}> {data?.net_liquidate_cash_after_fees}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {data?.gold_items?.length > 0 && (
            <Card className="mt-2">
              <CardContent>
                <Typography
                  className="text-uppercase"
                  variant="h2"
                  mb={2}
                  color={(theme) => theme.palette.text.gray500}
                >
                  Gold Piece Details
                </Typography>
                <List sx={{ py: 0 }}>
                  {data?.gold_items?.map((gold) => (
                    <ListItem sx={{ px: 0 }} key={gold._id}>
                      <ListItemAvatar>
                        <Image
                          src={`${s3URL}/${data?.customer_id}/${data?.liquidity_number}/${gold?.asset_images}`}
                          alt="img"
                          width={32}
                          height={32}
                          sx={{ borderRadius: 1 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ sx: { fontSize: 16, fontWeight: 'medium' } }}
                        primary={`${gold.name} - ${gold.gold_purity_entered_per_1000} Karat, ${gold.gold_weight} gram`}
                        secondary={gold.specification}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
        {(hasPermission('transactionProcessingSystem.Below25kApprove') ||
          hasPermission('transactionProcessingSystem.Above25kApprove')) && (
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            variant="contained"
            sx={{ marginTop: 2 }}
            loading={customLoading}
            onClick={() => {
              setCustomLoading(true);
              setTimeout(() => {
                onConfirmClick();
                setCustomLoading(false);
              }, 2000);
            }}
          >
            Confirm
          </LoadingButton>
        )}
      </Box>
    </Drawer>
  );
}
