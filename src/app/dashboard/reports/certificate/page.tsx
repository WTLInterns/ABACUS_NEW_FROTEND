import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { config } from '@/config';
import { CertificateSection } from '@/components/dashboard/reports/certificate-section';

export const metadata = { title: `Certificate | Reports | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function CertificatePage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <CertificateSection />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}