'use client';

import React, { useState, useEffect } from 'react';

import { Container } from '@mui/system';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import Loader from 'src/components/loader/Loader';
import NotificationList from './NotificationList';
import NotificationModel from './NotificationModel';

export default function NotificationView() {
  const settings = useSettingsContext();
  const [templateList, setTemplateList] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [editValue, setEditValue] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleEditTemplate = (val) => {
    setEditValue(val);
    setIsModelOpen(true);
  };

  const getNotificationTemplate = () => {
    const apiData = {
      notification_type: 'notification',
    };
    ApiCalling.apiCallPost('notification_template/get_notification', apiData)
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
    getNotificationTemplate();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Notification Template"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {loading ? (
          <Loader />
        ) : (
          <NotificationList
            list={templateList}
            onEdit={(val) => {
              if (val) {
                handleEditTemplate(val);
              }
            }}
          />
        )}
        <NotificationModel
          open={isModelOpen}
          onClose={() => {
            setIsModelOpen(false);
          }}
          editValue={editValue}
          onSave={getNotificationTemplate}
        />
      </Container>
    </div>
  );
}
