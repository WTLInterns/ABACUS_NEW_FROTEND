import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { config } from '@/config';
import { PromoteStudent } from '@/components/dashboard/students/promote-student';

export const metadata = { title: `Promote Student | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PromoteStudentPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <PromoteStudent />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}