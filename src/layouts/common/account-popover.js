import Link from 'next/link';
import { Fragment } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet, localStorageRemove } from 'src/localStorageUtils/localStorageUtils';

import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

export default function AccountPopover() {
  const router = useRouter();
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();

  const handleLogout = async () => {
    try {
      ApiCalling.apiCallPost('sign_out').then((res) => {
        router.replace('/');
        popover.onClose();
        localStorageRemove('loginData');
        localStorageRemove('isForgotPassword');
        localStorageRemove('otpProps');
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };
  const OPTIONS = [
    {
      label: 'Profile',
      linkTo: paths.profile,
      onClick: popover.onClose,
      color: (theme) => theme.palette.text.secondary,
    },
    {
      label: 'Sign Out',
      linkTo: '/',
      onClick: handleLogout,
      color: 'red',
    },
  ];
  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={`${s3URL}/${localStorageGet('loginData')?.id}/${
            localStorageGet('loginData')?.profile_image
          }`}
          alt={localStorageGet('loginData')?.first_name?.charAt(0).toUpperCase()}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="body1" noWrap>
            {`${localStorageGet('loginData')?.first_name} ${
              localStorageGet('loginData')?.last_name
            }`}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {localStorageGet('loginData')?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack>
          {OPTIONS.map((option) => (
            <Fragment key={option.label}>
              <Link href={option.linkTo} className="text-decoration-none px-2">
                <MenuItem sx={{ color: option.color, fontWeight: 600 }} onClick={option.onClick}>
                  {option.label}
                </MenuItem>
              </Link>
              <Divider sx={{ borderStyle: 'dashed' }} />
            </Fragment>
          ))}
        </Stack>

        <Typography variant="h6" style={{ margin: '6px', padding: '0px 10px' }}>
          version 1.0.0
        </Typography>
      </CustomPopover>
    </>
  );
}
