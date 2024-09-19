/* eslint-disable react/no-unstable-nested-components */
import moment from 'moment';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { globalUTCFormatDate } from 'src/utils/dateFormatter';

import { NotificationsType } from 'src/ENUMS/enums';

const DateDifference = ({ userDate }) => {
  const givenDate = moment.utc(userDate);
  const now = moment.utc();
  const differenceInHours = now.diff(givenDate, 'hours');

  if (differenceInHours < 24) {
    const formattedTime = givenDate.format('hh:mm A');
    return <>{formattedTime}</>;
  }
  // Older than yesterday, show the full date and time (AM/PM)
  const formattedDate = globalUTCFormatDate(userDate);
  const formattedTime = givenDate.format('hh:mm A'); // AM/PM format
  return (
    <>
      {formattedDate}, {formattedTime}
    </>
  );
};

DateDifference.propTypes = {
  userDate: PropTypes.string.isRequired,
};
export default function NotificationItem({ data, onClick }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const renderUnReadBadge = data.is_read === false && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  // const notificationType = Object.keys(NotificationsType)[data.notification_type];
  const notificationType = (type) => {
    switch (type) {
      case NotificationsType.ALL:
        return 'ALL';
      case NotificationsType.ALERT:
        return 'ALERT';
      case NotificationsType.GREETING:
        return 'GREETING';
      case NotificationsType.INQUIRY:
        return 'INQUIRY';
      case NotificationsType.PAYMENT:
        return 'PAYMENT';

      default:
        return 'ALL';
    }
  };

  const TitleWithAdditional = () => (
    <Box>
      <Typography variant="h4">{data.creator_details?.full_name}</Typography>
      <Typography variant="body2" color="textSecondary">
        {data.creator_details?.email}
      </Typography>
    </Box>
  );

  return (
    <ListItemButton
      disableRipple
      onClick={onClick}
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderUnReadBadge}

      <Avatar
        alt="Natacha"
        src={`${s3URL}/${data?.creator_details?._id}/${data?.creator_details?.profile_image}`}
        className="me-3"
      />

      <div>
        <ListItemText
          disableTypography
          primary={<TitleWithAdditional />}
          secondary={
            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'caption', color: 'text.disabled', mt: 0.7 }}
              divider={
                <Box
                  sx={{
                    width: 2,
                    height: 2,
                    bgcolor: 'currentColor',
                    mx: 0.5,
                    borderRadius: '50%',
                  }}
                />
              }
            >
              <DateDifference userDate={data.created_date} />
              {notificationType(data.notification_type)}
            </Stack>
          }
        />
        <Box
          sx={{
            p: 1.5,
            my: 1.5,
            borderRadius: 1.5,
            color: 'text.secondary',
            bgcolor: 'background.neutral',
          }}
        >
          {data.message}
        </Box>
      </div>
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  // data: PropTypes.object,
  data: PropTypes.shape({
    is_read: PropTypes.bool,
    notification_type: PropTypes.number,
    created_date: PropTypes.string,
    message: PropTypes.string,
    creator_details: PropTypes.object,
    full_name: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
