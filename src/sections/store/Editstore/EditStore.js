'use client';

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
import L from 'leaflet';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef, useState, useEffect } from 'react';
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import Dialog from '@mui/material/Dialog';
import { Button, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { handleLoader } from 'src/utils/loader';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
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

function EditStore({ open, onClose, editValue, onEdit }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');

  const firstFieldRef = useRef();
  const [isFormValid, setIsFormValid] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const EditStoreSchema = Yup.object().shape({
    storeName: Yup.string().required('Store Name is required'),
    storeAddress: Yup.string().required('Address is required'),
  });

  const defaultValues = {
    storeName: '',
    storeAddress: null,
  };
  const methods = useForm({
    resolver: yupResolver(EditStoreSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    getValues,
    watch,
  } = methods;

  const watchFields = watch(['storeName', 'storeAddress']);

  const onSubmit = handleSubmit(async (data) => {
    setCustomLoading(true);
    try {
      let error = false;
      if (position == null) {
        error = true;
      }
      if (!error) {
        const apiData = {
          store_id: editValue?._id,
          name: data.storeName,
          address: data.storeAddress,
          location: {
            country: address.country,
            region: address.state,
            city: address.city,
            latitude: position[0],
            longitude: position[1],
          },
        };
        ApiCalling.apiCallPatch('branch/update', apiData)
          .then((res) => {
            if (res.data) {
              setTimeout(() => {
                onEdit();
                setCustomLoading(false);
                onClose();
                ToasteMessage(res.data.message, 'success');
              }, 2000);
            } else {
              console.log('error'.res?.response?.data?.message);
              handleLoader(setCustomLoading, false, 500);
            }
          })
          .catch((error) => {
            handleLoader(setCustomLoading, false, 500);
            console.log(error);
          });
      }
    } catch (error) {
      handleLoader(setCustomLoading, false, 500);
      console.error(error);
    }
  });
  const handleMapClick = async (latlng) => {
    if (!latlng) return;
    const { lat, lng } = latlng;
    setPosition([lat, lng]);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    const data = await response.json();
    if (data && data.address) {
      const { country, state, county, city, suburb } = data.address;

      const addressData = {
        country,
        state: state || county || suburb,
        city: city || suburb,
      };
      setAddress(addressData);
    } else {
      setAddress('Address not found');
    }
  };

  const LocationMarker = ({ position, address }) => {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
      },
    });

    return position === undefined || position === null ? null : (
      <Marker position={position} icon={customIcon}>
        <Popup>{address}</Popup>
      </Marker>
    );
  };
  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        id="outlined-email"
        label="Store Name"
        type="text"
        name="storeName"
        inputRef={firstFieldRef}
      />
      <RHFTextArea id="outlined-email" label="Store Address" type="text" name="storeAddress" />
      <MapContainer
        center={position !== null ? position : [51.505, -0.09]}
        zoom={13}
        style={{ height: '200px', width: '100%', margin: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker position={position} address={address} />
      </MapContainer>
      <div className="text-center pb-3">
        <LoadingButton
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={customLoading}
          disabled={!isFormValid}
        >
          Update
        </LoadingButton>
      </div>
    </Stack>
  );
  useEffect(() => {
    if (editValue) {
      setPosition([editValue?.location?.latitude, editValue?.location?.longitude]);
      const getAddressData = {
        country: editValue?.location?.country,
        state: editValue?.location?.region,
        city: editValue?.location?.city,
      };
      setAddress(getAddressData);
    }
  }, [editValue]);

  useEffect(() => {
    const { storeName, storeAddress } = getValues();
    setIsFormValid(!!storeName && !!storeAddress);
  }, [watchFields, getValues]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          reset();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        TransitionProps={{
          onEntered: () => {
            if (firstFieldRef.current) {
              firstFieldRef.current.focus();
            }
            if (editValue !== null) {
              reset({ storeName: editValue.name, storeAddress: editValue.address });
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: "flex", alignItems: "center" }}>
          <Typography fontSize={16} fontWeight={600}>
            Edit Store
          </Typography>
          <Button
            onClick={onClose}
            sx={{ width: 28, height: 28, minWidth: 'auto', marginLeft: 'auto' }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          <div className="pt-3 pb-3">
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default EditStore;
