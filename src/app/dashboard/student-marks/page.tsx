import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { config } from '@/config';
import { StudentMarks } from '@/components/dashboard/students/student-marks';

export const metadata = { title: `Student Marks | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function StudentMarksPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <StudentMarks />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}