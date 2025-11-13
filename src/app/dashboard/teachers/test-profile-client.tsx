'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { TeacherProfile } from '@/components/dashboard/teachers/teacher-profile';

export default function TestTeacherProfileClient(): React.JSX.Element {
  // Mock teacher data for testing
  const mockTeacher = {
    id: 1001,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'TEACHER',
    branchNames: ['Branch A', 'Branch B'],
    education: 'M.Sc. Mathematics',
    marksheet: 'A+ Grade',
    invoice: 'INV-2023-001',
    paymentType: 'cash',
    profilePicture: null,
  };

  const handleUpdate = (updatedTeacher: any) => {
    console.log('Teacher updated:', updatedTeacher);
    // In a real app, you would update the state or refetch the teacher data
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TeacherProfile teacher={mockTeacher} onUpdate={handleUpdate} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}