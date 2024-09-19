/* eslint-disable react/prop-types */
import React from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Close from '@mui/icons-material/Close';
import PaidIcon from '@mui/icons-material/CheckCircle';
import ExpiredIcon from '@mui/icons-material/HighlightOff';
import OverdueIcon from '@mui/icons-material/ErrorOutline';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { Card, Drawer, Button, Tooltip, Typography, CardContent } from '@mui/material';

import { EmiStatus } from 'src/ENUMS/enums';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import LiquidityCard from 'src/components/sanaddak/Gold-Valuation/LiquidityCard';

export default function Buyback({ open, onClose, data, onBuybackClick }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case EmiStatus.PENDING:
        return (
          <Tooltip title={EmiStatus.PENDING}>
            <HistoryToggleOffIcon style={{ fontSize: 20, color: 'orange' }} />
          </Tooltip>
        );
      case EmiStatus.PAID:
        return (
          <Tooltip title={EmiStatus.PAID}>
            <PaidIcon style={{ fontSize: 20, color: 'green' }} />
          </Tooltip>
        );
      case EmiStatus.EXPIRED:
        return (
          <Tooltip title={EmiStatus.EXPIRED}>
            <ExpiredIcon style={{ fontSize: 20, color: 'red' }} />
          </Tooltip>
        );
      case EmiStatus.OVERDUE:
        return (
          <Tooltip title={EmiStatus.OVERDUE}>
            <OverdueIcon style={{ fontSize: 20, color: 'red' }} />
          </Tooltip>
        );
      default:
        return null;
    }
  };
  return (
    <div>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          sx={{ width: 450, padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
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
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              Buyback
              <Button
                onClick={onClose}
                sx={{ width: 28, height: 28, minWidth: 'auto', marginRight: 1, marginLeft: 'auto' }}
              >
                <Close />
              </Button>
            </Typography>

            <LiquidityCard
              liquidity_amt={data?.available_liquidity_to_customer}
              l_id={data?.liquidate_number}
              installment={data?.installments[0]?.emi_amount}
              m_rate={data?.margin_rate}
              tenure={data?.tenure_in_months}
              total_margin={data?.total_margin}
              karat={data?.gold_karatage}
              weight={data?.gold_weight}
            />

            <Card
              sx={{
                marginTop: 2,
              }}
            >
              <CardContent>
                <Typography
                  className="text-14 fw-bold mb-3"
                  color={(theme) => theme.palette.text.gray500}
                  gutterBottom
                >
                  BUYBACK DETAILS
                </Typography>
                <Box component="div">
                  {data?.installments?.map((d, i) => (
                    <Box key={i} component="div" display="flex" flexDirection="column" mb={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                        >
                          Installment {d.emi_number}
                        </Typography>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={1}
                        >
                          <Typography className="text-14 fw-bold">{d.emi_amount}</Typography>
                          <Typography>{getStatusIcon(d.emi_status)}</Typography>
                        </Box>
                      </Box>
                      {d.penalty.replace(/[^\d.-]/g, '') > 0 && (
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 12 }}
                          >
                            Penalty for Installment {d.emi_number}
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={1}
                          >
                            <Typography className="text-12 fw-bold">
                              {d.penalty_weive.replace(/[^\d.-]/g, '') > 0
                                ? d.net_penalty
                                : d.penalty}
                            </Typography>
                            <Box sx={{ width: '20px' }} />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                  {data?.total_buyback_penalty.replace(/[^\d.-]/g, '') > 0 && (
                    <Box
                      component="div"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        sx={{ color: (theme) => theme.palette.text.gray500, fontSize: 14 }}
                      >
                        Total penalty Amount
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <Typography className="text-14 fw-bold">
                          {data?.total_buyback_penalty}
                        </Typography>
                        <Box sx={{ width: '20px' }} />
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
            <Card
              sx={{
                marginTop: 2,
              }}
            >
              <CardContent>
                <Typography
                  className="text-14 fw-bold mb-3"
                  color={(theme) => theme.palette.text.gray500}
                  gutterBottom
                >
                  TOTAL BUYBACK AMOUNT
                </Typography>
                <Typography variant="h6" color={(theme) => theme.palette.text.gray500} gutterBottom>
                  To Buyback your gold, as determined by your financing agreement, you are required
                  to pay:
                </Typography>
                <Typography variant="h2" mt={2}>
                  {data?.total_buyback_amount}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          {localStorageGet('loginData')?.is_admin ||
          (!localStorageGet('loginData')?.is_admin &&
            localStorageGet('loginData')?.store_id === data?.store_id) ? (
            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              variant="contained"
              sx={{ marginTop: 2 }}
              onClick={onBuybackClick}
            >
              Proceed
            </LoadingButton>
          ) : (
            ''
          )}
        </Box>
      </Drawer>
    </div>
  );
}
