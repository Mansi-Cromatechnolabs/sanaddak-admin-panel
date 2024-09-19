/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useState, useEffect } from 'react';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import Loader from 'src/components/loader/Loader';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AgreementList from './AgreementList';
import AgreementModel from './AgreementModel';

export default function AgreementView() {
  const settings = useSettingsContext();
  const [agreementList, setAgreementList] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [editValue, setEditValue] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleEditTenure = (val) => {
    setEditValue(val);
    setIsModelOpen(true);
  };

  const getAgreement = () => {
    ApiCalling.apiCallGet('agreement_template')
      .then((res) => {
        if (res.data) {
          setAgreementList(res.data.data);
        }
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getAgreement();
  }, []);

  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Agreement"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : (
          <AgreementList
            list={agreementList}
            onEdit={(val) => {
              if (val) {
                handleEditTenure(val);
              }
            }}
          />
        )}

        <AgreementModel
          open={isModelOpen}
          onClose={() => {
            setIsModelOpen(false);
          }}
          editValue={editValue}
          onEdit={getAgreement}
        />
      </Container>
    </div>
  );
}
