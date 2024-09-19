'use client';

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable arrow-body-style */
/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
import L from 'leaflet';
import React from 'react';
import { Marker, TileLayer, MapContainer } from 'react-leaflet';

import { Box } from '@mui/system';
import Grow from '@mui/material/Grow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Grid, List, ListItem, Typography } from '@mui/material';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';
import { Close } from '@mui/icons-material';

const customSVGIcon = `
<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C7.02944 2 3 6.02944 3 11C3 16.621 12 22 12 22C12 22 21 16.621 21 11C21 6.02944 16.9706 2 12 2ZM12 14.5C10.0147 14.5 8.5 13.0853 8.5 11C8.5 8.91472 10.0147 7.5 12 7.5C13.9853 7.5 15.5 8.91472 15.5 11C15.5 13.0853 13.9853 14.5 12 14.5Z" fill="red"/>
</svg>
`;

const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(customSVGIcon)}`,
  iconSize: [30, 49],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function ViewStoreDetails({ open, onClose, getData }) {
  const days = getData?.day_availabilities;
  const holidays = getData?.holidays;

  const LocationMarker = ({ position }) => {
    if (!position || !position[0] || !position[1]) return null;
    return position ? <Marker position={position} icon={customIcon} /> : null;
  };
  const sortByWeekOrder = () => {
    return days?.sort((a, b) => {
      return weekOrder.indexOf(a.day.toLowerCase()) - weekOrder.indexOf(b.day.toLowerCase());
    });
  };

  const sortedDays = sortByWeekOrder();
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        TransitionProps={{
          onEntered: () => {
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: "flex", alignItems: "center" }}>
          <Typography fontSize={16} fontWeight={600}>
            View Store Details
          </Typography>
          <Button
            onClick={onClose}
            sx={{ width: 28, height: 28, minWidth: 'auto', marginLeft: 'auto' }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} md={6} sm={6}>
              <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
                {getData?.name}
              </Typography>
              <Box display="flex" alignItems="center" mb={3} ml={-0.75}>
                <LocationOnIcon color="action" />
                <Typography variant="h4" ml={1} color={(theme) => theme.palette.text.gray500}>
                  {getData?.address}, {getData?.location?.city} ,{getData?.location?.region}
                </Typography>
              </Box>
              <Typography variant="h2" mb={2} color={(theme) => theme.palette.text.primary}>
                Day Availability
              </Typography>
              {sortedDays?.map((item, i) => (
                <Grid container key={i} mt={1}>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography
                      className="text-capitalize"
                      variant="h4"
                      color={(theme) => theme.palette.text.gray500}
                    >
                      {item.day}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="h4" fontWeight={600}>
                      {item.is_open ? 'Open' : 'Close'}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Grid item xs={6} md={6} sm={6}>
              <MapContainer
                center={[getData?.location?.latitude, getData?.location?.longitude]}
                zoom={13}
                style={{ height: '300px', width: '100%', margin: 1 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker
                  position={[getData?.location?.latitude, getData?.location?.longitude]}
                />
              </MapContainer>
            </Grid>
          </Grid>

          <Typography variant="h2" mt={3} color={(theme) => theme.palette.text.primary}>
            Store Holidays
          </Typography>
          <List sx={{ mb: 2 }}>
            {holidays?.length > 0 ? (
              holidays?.map((holiday, index) => (
                <ListItem key={index} divider>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4} sx={{ pl: '0 !important' }}>
                      <Typography variant="body1">
                        {globalUTCFormatDate(holiday.holiday_date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{holiday.name}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))
            ) : (
              <Typography variant="h4">Not Configured</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default ViewStoreDetails;
