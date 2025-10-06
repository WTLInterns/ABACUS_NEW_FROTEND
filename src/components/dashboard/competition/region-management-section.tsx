'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { RegionManagementForm } from '../regions/region-management-form';

export function RegionManagementSection(): React.JSX.Element {
  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader 
        title="Region Management" 
        subheader="Manage countries, states, districts, and talukas for competitions"
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Configure the geographical hierarchy for competitions. Start by adding countries, then states, districts, and finally talukas.
          </Typography>
        </Box>
        <RegionManagementForm />
      </CardContent>
    </Card>
  );
}