'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { LoadingButton } from '@/components/core/loading-button';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email is required' }).email() });

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);

      // Redirect to confirm password reset
    },
    [setError]
  );

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          component="video"
          src="/assets/adminBackground.mp4"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(12px)',
            transform: 'scale(1.05)',
          }}
        />
      </Box>
      <Box
        component="video"
        src="/assets/adminBackground.mp4"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'contain',
          objectPosition: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'start',
          px: 3,
          pt: 3.5,
          pb: 2.5,
          marginTop: '-0.25rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            marginTop: '1.5rem',
            p: { xs: 2.5, sm: 3 },
            bgcolor: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
              Reset password
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.email)}>
                      <InputLabel>Email address</InputLabel>
                      <OutlinedInput {...field} label="Email address" type="email" />
                      {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                    </FormControl>
                  )}
                />
                {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
                <LoadingButton
                  loading={isPending}
                  type="submit"
                  variant="contained"
                  loadingText="Sending recovery link..."
                  sx={{ py: 1.2 }}
                >
                  Send recovery link
                </LoadingButton>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
