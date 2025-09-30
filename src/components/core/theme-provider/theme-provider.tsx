'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { createTheme } from '@/styles/theme/create-theme';
import { useTheme } from '@/contexts/theme-context';

import EmotionCache from './emotion-cache';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

function CustomThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const { mode } = useTheme();
  const theme = createTheme();

  return (
    <EmotionCache options={{ key: 'mui' }}>
      <MuiThemeProvider theme={theme} defaultMode={mode}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </EmotionCache>
  );
}

export { CustomThemeProvider as ThemeProvider };