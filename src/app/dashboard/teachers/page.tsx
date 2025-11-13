import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { config } from '@/config';
import { AddTeacherForm } from '@/components/dashboard/teachers/add-teacher-form';
import Link from 'next/link';

export const metadata = { title: `Teachers | Admin Dashboard | ${config.site.name}` } satisfies Metadata;

export default function TeachersPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              component={Link} 
              href="/dashboard/teachers/profile?id=1001" 
              variant="contained"
            >
              View Sample Profile
            </Button>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AddTeacherForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}