/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */

'use client';

import { useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import LockIcon from '@mui/icons-material/Lock';
import Container from '@mui/material/Container';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, Tab, Card, Grid, Tabs, Paper, Avatar, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProfileSetting from './ProfileSetting';
import ChangePassword from './ChangePassword';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}
function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function ProfileView() {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const settings = useSettingsContext();
  const [value, setValue] = useState(0);
  const [profileData, setProfileData] = useState({});
  const [isUpdated, setIsUpdated] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const list = [
    {
      name: 'Profile',
      icon: <AccountCircleIcon />,
    },
    {
      name: 'Change Password',
      icon: <LockIcon />,
    },
  ];

  const getProfileData = () => {
    ApiCalling.apiCallGet('staff')
      .then((res) => {
        if (res.data) {
          const profileData = res.data.data;
          setProfileData({
            id: profileData?._id,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            avtar: profileData.profile_image,
            role: profileData.role,
          });
          setIsUpdated(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getProfileData();
  }, [isUpdated]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading=" Profile"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },

          { name: 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
            }}
          >
            <Paper>
              <Stack direction="row" useFlexGap flexWrap="wrap" alignItems="center" gap={2} mb={3}>
                <Avatar
                  sx={{ width: 60, height: 60 }}
                  alt={profileData?.firstName?.charAt(0).toUpperCase()}
                  src={
                    profileData?.avtar ? `${s3URL}/${profileData?.id}/${profileData?.avtar}` : ''
                  }
                />
                <Paper>
                  {profileData.firstName && (
                    <Typography variant="h2" className="text-capitalize">
                      {profileData.firstName}&nbsp;{profileData.lastName}
                    </Typography>
                  )}
                  {profileData.role && (
                    <Typography variant="h5">{profileData?.role?.join(',')}</Typography>
                  )}
                </Paper>
              </Stack>
            </Paper>
            <Tabs
              orientation="vertical"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              sx={{
                width: '100%',
                '.MuiButtonBase-root': {
                  marginRight: '0 !important',
                  maxWidth: '100%',
                },
                '.MuiTabs-indicator': {
                  display: 'none',
                },
                '.MuiTab-root': {
                  borderRadius: '6px',
                  marginBottom: 1,
                  border: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'grey.800',
                    color: 'common.white',
                    border: 'none',
                  },
                  '&:hover': {
                    color: 'common.white',
                    border: 'none',
                    backgroundColor: 'grey.700',
                  },
                },
              }}
            >
              {list.map((item) => (
                <Tab
                  key={item.name}
                  sx={{ justifyContent: 'start', p: 2 }}
                  label={item.name}
                  {...a11yProps(item.name)}
                  icon={item.icon}
                />
              ))}
            </Tabs>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <TabPanel value={value} index={0}>
              <ProfileSetting
                updated={(isupdated) => {
                  if (isupdated) {
                    setIsUpdated(true);
                  }
                }}
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ChangePassword />
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
