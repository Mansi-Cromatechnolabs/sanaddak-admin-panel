'use client';

import React, { useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import { Button } from '@mui/material';
import Container from '@mui/material/Container';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import HolidaysList from './holidaysList';
import HolidaysModel from './holidaysModel';
import StoreListDropdown from '../StoreListDropdown';

export default function HolidaysView() {
  const firstFieldRef = useFocusOnMount();
  const settings = useSettingsContext();
  const [isShowHolidaysModel, setIsShowHolidaysModel] = useState(false);
  const [holidaysList, setHolidaysList] = useState([]);
  const [editValue, setEditValue] = useState(null);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const localStoreId = localStorageGet('loginData')?.store_id;
    if (localStoreId) {
      setStoreId(localStoreId);
    }
  }, []);

  const handleAddHolidays = async () => {
    setEditValue(null);
    setIsShowHolidaysModel(true);
  };

  const handleEditHolidays = (val) => {
    setEditValue(val);
    setIsShowHolidaysModel(true);
  };

  useEffect(() => {
    if (storeId) {
      getHolidaysList(storeId);
    }
  }, [storeId]);

  const getHolidaysList = (id) => {
    if (!id) return;
    ApiCalling.apiCallGet(`appointment/store_holiday?store_id=${id}`)
      .then((res) => {
        if (res.data) {
          setHolidaysList(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteHolidays = (id) => {
    const apiData = {
      id,
    };
    ApiCalling.apiCallDelete('appointment/store_holiday', apiData)
      .then((res) => {
        if (res.data.status === 200) {
          getHolidaysList(storeId);
          ToasteMessage(res.data.message, 'success');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Holidays"
          links={[{ name: '' }]}
          sx={{
            mb: { xs: 3, md: 2 },
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={4}
        >
          <StoreListDropdown
            inputRef={firstFieldRef}
            storeId={storeId || ''}
            setStoreId={setStoreId}
          />
          <Button
            onClick={handleAddHolidays}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Holidays
          </Button>
        </Stack>

        <HolidaysList
          list={holidaysList}
          onEdit={(val) => {
            if (val) {
              handleEditHolidays(val);
            }
          }}
          onDelete={(id) => {
            if (id) {
              handleDeleteHolidays(id);
            }
          }}
        />
        <HolidaysModel
          storeId={storeId}
          open={isShowHolidaysModel}
          onClose={() => {
            setIsShowHolidaysModel(false);
          }}
          onSave={() => {
            setIsShowHolidaysModel(false);
            setEditValue(null);
            getHolidaysList(storeId);
          }}
          editValue={editValue}
        />
      </Container>
    </div>
  );
}
