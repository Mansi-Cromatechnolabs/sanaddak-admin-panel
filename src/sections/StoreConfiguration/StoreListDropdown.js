import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import ApiCalling from 'src/ApiCalling/ApiCalling';

const StoreListDropdown = ({ storeId, setStoreId }) => {
  const methods = useForm({
    defaultValues: {
      singleSelect: '',
    },
  });
  const [storeList, setStoreList] = useState([]);
  const {
    handleSubmit,
    control,
    reset,
    setValue,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const getStoreList = () => {
    ApiCalling.apiCallGet('branch/branch_list')
      .then((res) => {
        if (res.data) {
          setStoreList(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getStoreList();
  }, []);

  useEffect(() => {
    if (storeId) {
      setValue('singleSelect', storeId);
    }
  }, [storeId, setValue]);

  return (
    <FormProvider {...methods} onSubmit={onSubmit}>
      <Controller
        name="singleSelect"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl sx={{ minWidth: 250 }} variant="outlined" margin="normal">
            <InputLabel id="search-select-label">Select Store</InputLabel>
            <Select
              {...field}
              MenuProps={{
                autoFocus: false,
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    maxWidth: 250,
                    minWidth: 250,
                  },
                },
              }}
              labelId="search-select-label"
              id="search-select"
              label="Select Store"
              renderValue={(selectedId) => {
                const selectCustomer = storeList.find((s) => s._id === selectedId);
                return selectCustomer ? `${selectCustomer.name} ` : '';
              }}
              onChange={(e) => {
                const sId = e.target.value;
                field.onChange(sId);
                setStoreId(sId);
              }}
            >
              {storeList.map((option, i) => (
                <MenuItem
                  sx={{
                    width: 320,
                  }}
                  key={i}
                  value={option._id}
                >
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </FormProvider>
  );
};

StoreListDropdown.propTypes = {
  storeId: PropTypes.string.isRequired,
  setStoreId: PropTypes.func.isRequired,
};

export default StoreListDropdown;
