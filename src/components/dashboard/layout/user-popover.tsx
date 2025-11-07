import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

// Capitalize first letter of role
function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession, user } = useUser();
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);

  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router and we need to do it manually
      router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (error) {
      logger.error('Sign out error', error);
    }
  }, [checkSession, router]);

  const handleLogoutClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onClose(); // Close the popover first
    setOpenConfirmDialog(true);
  };

  const handleConfirmLogout = () => {
    setOpenConfirmDialog(false);
    handleSignOut();
  };

  const handleCancelLogout = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <React.Fragment>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={onClose}
        open={open}
        slotProps={{ paper: { sx: { width: '240px' } } }}
      >
        <Box sx={{ p: '16px 20px ' }}>
          {user ? (
            <>
              <Typography variant="subtitle1">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {user.email}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                {capitalizeRole(user.role || 'User')}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="subtitle1">Guest User</Typography>
              <Typography color="text.secondary" variant="body2">
                user@example.com
              </Typography>
            </>
          )}
        </Box>
        <Divider />
        <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
          {/* <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
            <ListItemIcon>
              <GearSixIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            Settings
          </MenuItem> */}
          <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
            <ListItemIcon>
              <UserIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <SignOutIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </MenuList>
      </Popover>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelLogout}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}