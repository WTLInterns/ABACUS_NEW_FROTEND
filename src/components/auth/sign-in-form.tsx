'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import authService from '@/services/auth-service';
import { clearAllClientSideData } from '@/lib/storage';
import { LoadingButton } from '@/components/core/loading-button';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
  accountType: zod.enum(['teacher', 'admin', 'master_admin'], { message: 'Account type is required' }),
});

type Values = {
  email: string;
  password: string;
  accountType: 'teacher' | 'admin' | 'master_admin';
};

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [notification, setNotification] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // Clear all cookies and storage on mount to ensure fresh sign-in
  React.useEffect(() => {
    try { 
      clearAllClientSideData(); 
    } catch {
      // Ignore errors during cleanup
    }
  }, []);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      // Choose API based on account type. Treat 'admin' same as 'master_admin'.
      const isMasterAdmin = values.accountType === 'master_admin' || values.accountType === 'admin';
      const loginCall = isMasterAdmin
        ? authService.masterAdminLogin({ email: values.email, password: values.password })
        : authService.teacherLogin({ email: values.email, password: values.password });

      const { error, data } = await loginCall;

      if (error) {
        // Show error notification
        setNotification({
          open: true,
          message: error,
          severity: 'error',
        });
        setIsPending(false);
        return;
      }

      // Show success notification
      setNotification({
        open: true,
        message: 'Successfully signed in! Redirecting...',
        severity: 'success',
      });

      // Optionally refresh auth state if hook supports it
      await checkSession?.();

      // Redirect based on role if available
      const role = data?.role;
      if (role === 'teacher') {
        router.push(paths.dashboard.teacher);
      } else if (role === 'admin' || role === 'master_admin') {
        router.push(paths.dashboard.admin);
      } else {
        router.push(paths.dashboard.overview);
      }

      setIsPending(false);
      router.refresh();
    },
    [checkSession, router]
  );

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="accountType"
            render={({ field }) => (
              <FormControl error={Boolean(errors.accountType)}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  label=""
                  displayEmpty
                  value={(field.value as string | undefined) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                >                 
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {errors.accountType ? <FormHelperText>{errors.accountType.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput
                  label="Email address"
                  type="email"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <LoadingButton loading={isPending} type="submit" variant="contained" loadingText="Signing in...">
            Sign in
          </LoadingButton>
        </Stack>
      </form>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}