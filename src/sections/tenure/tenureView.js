'use client';

import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import TenureList from './tenureList';
import TenureModel from './tenureModel';

export default function TenureView() {
  const settings = useSettingsContext();
  const [isShowTenureModel, setIsShowTenureModel] = useState(false);
  const [tenureList, setTenureList] = useState([]);
  const [editValue, setEditValue] = useState(null);

  const handleAddTenure = () => {
    setEditValue(null);
    setIsShowTenureModel(true);
  };

  const handleEditTenure = (val) => {
    setEditValue(val);
    setIsShowTenureModel(true);
  };

  const handleDeleteTenure = (id) => {
    const index = tenureList.indexOf(id);

    tenureList.splice(index, 1);

    const apiData = {
      type: 'appointment',
      key: 'tenure',
      value: tenureList,
    };

    ApiCalling.apiCallPatch('global_config', apiData)
      .then((res) => {
        if (res.data) {
          getTenureList();
          ToasteMessage("Tenure Delete Successfully.", 'error');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getTenureList = () => {
    const apiData = {
      key: 'tenure',
    };
    ApiCalling.apiCallPost('global_config', apiData)
      .then((res) => {
        if (res.data) {
          setTenureList(res.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    getTenureList();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Tenure"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('globalConfig.update') && (
              <Button
                onClick={handleAddTenure}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Tenure
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <TenureList
          list={tenureList}
          onEdit={(val) => {
            if (val) {
              handleEditTenure(val);
            }
          }}
          onDelete={(k) => {
            if (k) {
              handleDeleteTenure(k);
            }
          }}
        />
        <TenureModel
          list={tenureList}
          open={isShowTenureModel}
          onClose={() => {
            setIsShowTenureModel(false);
          }}
          onSave={() => {
            setIsShowTenureModel(false);
            setEditValue(null);
            getTenureList();
          }}
          editValue={editValue}
        />
      </Container>
    </div>
  );
}
