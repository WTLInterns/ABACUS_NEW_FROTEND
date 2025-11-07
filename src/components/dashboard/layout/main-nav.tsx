'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { DynamicLogo } from '@/components/core/logo';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

// Capitalize first letter of role
const capitalizeRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user } = useUser();

  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            {/* Logo added here */}
            {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <DynamicLogo height={40} width={120} />
            </Box> */}
            {/* <Tooltip title="Search">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip> */}
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {user && (
              <Typography variant="h6" sx={{ display: { xs: 'none', md: 'block' } }}>
                Welcome {capitalizeRole(user.role || 'User')}, {user.firstName} {user.lastName}
              </Typography>
            )}

            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={user?.avatar || '/assets/avatar.png'}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}