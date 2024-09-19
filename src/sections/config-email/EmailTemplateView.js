'use client';

import React, { useState, useEffect } from 'react';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import Loader from 'src/components/loader/Loader';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import EmailTemplateList from './EmailTemplateList';
import EmailTemplateModel from './EmailTemplateModel';

export default function EmailTemplateView() {
  const settings = useSettingsContext();
  const [templateList, setTemplateList] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [editValue, setEditValue] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleEditTemplate = (val) => {
    setEditValue(val);
    setIsModelOpen(true);
  };

  const getEmailTemplate = () => {
    ApiCalling.apiCallGet('email_template')
      .then((res) => {
        if (res.data) {
          setTemplateList(res.data.data);
        }
      })
      .catch((error) => {
        console.log('error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getEmailTemplate();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Email Template"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : (
          <EmailTemplateList
            list={templateList}
            onEdit={(val) => {
              if (val) {
                handleEditTemplate(val);
              }
            }}
          />
        )}
        <EmailTemplateModel
          open={isModelOpen}
          onClose={() => {
            setIsModelOpen(false);
          }}
          editValue={editValue}
          onSave={getEmailTemplate}
        />
      </Container>
    </div>
  );
}
