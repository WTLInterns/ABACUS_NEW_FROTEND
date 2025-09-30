import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { config } from '@/config';

export const metadata = { title: `Pending Approval | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PendingApprovalPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Student Pending for Approval" />
              <CardContent>
                <Typography variant="body1">
                  This page shows students pending for approval. Teachers can review and approve student records.
                </Typography>
                {/* Add approval-specific components here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}