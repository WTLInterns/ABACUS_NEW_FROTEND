'use client';

import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { Dayjs } from 'dayjs';

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  [`& .${outlinedInputClasses.root}`]: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
  [`& .${outlinedInputClasses.input}`]: {
    padding: '12px 14px',
    fontSize: '0.875rem',
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    border: 'none',
  },
}));

interface CustomDatePickerProps {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  label: string;
  error?: boolean;
  helperText?: string;
}

export function CustomDatePicker({ value, onChange, label, error, helperText }: CustomDatePickerProps): React.JSX.Element {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatePicker
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{
          textField: {
            error,
            helperText,
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}