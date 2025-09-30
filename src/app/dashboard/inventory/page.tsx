import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { config } from '@/config';
import { InventoryForm } from '@/components/dashboard/inventory/inventory-form';

export const metadata = { title: `Manage Inventory | Admin Dashboard | ${config.site.name}` } satisfies Metadata;

export default function InventoryPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <InventoryForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}