/* eslint-disable arrow-body-style */
import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import { Tooltip } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { info } from 'src/theme/palette';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';

import NotificationItem from './notification-item';

export default function NotificationsPopover() {
  const drawer = useBoolean();

  const smUp = useResponsive('up', 'sm');

  const [currentTab, setCurrentTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [notificationsId, setNotificationsId] = useState(null);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  useEffect(() => {
    getProfileData();
  }, []);

  const getProfileData = () => {
    ApiCalling.apiCallGet('staff_notifications')
      .then((res) => {
        if (res?.data) {
          const response = res.data.data;
          const sortedNotifications = response.sort(
            (a, b) => new Date(b.created_date) - new Date(a.created_date)
          );
          setNotifications(sortedNotifications);
        }
      })
      .catch((error) => {
        console.error('Error fetching profile data:', error);
      });
  };

  const filteredNotifications = notifications.filter((item) => {
    if (currentTab === 'all') {
      return true;
    }
    if (currentTab === 'unread') {
      return item.is_read === false;
    }
    return true;
  });

  const TABS = [
    {
      value: 'all',
      label: 'All',
      count: notifications.length,
    },
    {
      value: 'unread',
      label: 'Unread',
      count: notifications.filter((item) => item.is_read === false).length,
    },
  ];

  const handleMarkAsRead = (id) => {
    try {
      setNotificationsId(id);
      setNotifications(
        notifications.map((notification) => {
          return notification._id === id && !notification.is_read
            ? { ...notification, is_read: true }
            : notification;
        })
      );
      ApiCalling.apiCallPatch('staff_notifications/read_notification', notificationsId).then(
        (res) => {
          if (res?.data) {
            // console.log(res.data);
          } else {
            // if (res?.response?.data) {
            // console.log(res?.response?.data?.message);
            // }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter((notification) => !notification.is_read);
    if (unreadNotifications.length === 0) return;
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      is_read: true,
    }));

    setNotifications(updatedNotifications);

    ApiCalling.apiCallPatch('staff_notifications/read_notification').catch((error) => {
      console.error(error);
    });
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h2" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={(tab.value === 'unread' && 'info') || 'default'}
            >
              {tab.count}
            </Label>
          }
          sx={{
            '&:not(:last-of-type)': {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderList = (
    <Scrollbar>
      <List disablePadding>
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            data={notification}
            onClick={() => handleMarkAsRead(notification._id)}
          />
        ))}
      </List>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
      >
        <Badge
          badgeContent={notifications.filter((item) => item.is_read === false).length}
          color="error"
        >
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
          <Tooltip title="Mark as Read">
            <IconButton onClick={handleMarkAllAsRead}>
              <DoneAllIcon
                sx={{
                  color: notifications.some((item) => !item.is_read) ? info.main : grey.main,
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider />
        {renderList}
      </Drawer>
    </>
  );
}
