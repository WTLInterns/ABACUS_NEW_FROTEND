'use client';

import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps): React.JSX.Element {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} color="inherit" />
          <span>{loadingText || children}</span>
        </Stack>
      ) : (
        children
      )}
    </Button>
  );
}