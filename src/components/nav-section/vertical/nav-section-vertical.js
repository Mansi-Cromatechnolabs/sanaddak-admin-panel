import PropTypes from 'prop-types';
import { memo, useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import ListSubheader from '@mui/material/ListSubheader';

import NavList from './nav-list';

// ----------------------------------------------------------------------

function NavSectionVertical({ data, slotProps, ...other }) {
  return (
    <Stack component="nav" id="nav-section-vertical" {...other}>
      {data.map((group, index) => (
        <Group
          key={group.subheader || index}
          subheader={group.subheader}
          items={group.items}
          slotProps={slotProps}
        />
      ))}
    </Stack>
  );
}

NavSectionVertical.propTypes = {
  data: PropTypes.array,
  slotProps: PropTypes.object,
};

export default memo(NavSectionVertical);

// ----------------------------------------------------------------------

function Group({ subheader, items, slotProps }) {
  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const renderContent = items.map((list, i) => (
    <Stack id="menu-list" key={i}>
      <NavList data={list} depth={1} slotProps={slotProps} />
    </Stack>
  ));

  useEffect(() => {
    const menuList = document.querySelector('#menu-list');
    menuList?.scrollIntoView({
      behavior: 'smooth'
    }, 500)

  }, []);  

  return (
    <Stack sx={{ px: 2 }}>
      {subheader ? (
        <Box key={open}>
          <ListSubheader
            disableGutters
            disableSticky
            onClick={handleToggle}
            sx={{
              fontSize: 11,
              cursor: 'pointer',
              typography: 'overline',
              display: 'inline-flex',
              color: 'text.disabled',
              mb: `${slotProps?.gap || 4}px`,
              p: (theme) => theme.spacing(2, 1, 1, 1.5),
              transition: (theme) =>
                theme.transitions.create(['color'], {
                  duration: theme.transitions.duration.shortest,
                }),
              '&:hover': {
                color: 'text.primary',
              },
              ...slotProps?.subheader,
            }}
          >
            {subheader}
          </ListSubheader>
          {renderContent}
        </Box>
      ) : (
        renderContent
      )}
    </Stack>
  );
}

Group.propTypes = {
  items: PropTypes.array,
  subheader: PropTypes.string,
  slotProps: PropTypes.object,
};
