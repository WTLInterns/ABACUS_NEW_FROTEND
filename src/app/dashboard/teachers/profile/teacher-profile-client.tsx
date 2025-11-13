'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { TeacherProfile } from '@/components/dashboard/teachers/teacher-profile';
import { getTeacherById } from '@/services/teacher-service';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeacherProfileClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get('id');
  
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setError('No teacher ID provided');
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const teacherData = await getTeacherById(parseInt(teacherId));
        setTeacher(teacherData);
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher:', err);
        setError('Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleUpdate = (updatedTeacher: any) => {
    setTeacher(updatedTeacher);
  };

  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading teacher profile...</div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box component="main" sx={{ flexGrow: 1, py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Error: {error}</div>
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Box component="main" sx={{ flexGrow: 1, py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Teacher not found</div>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TeacherProfile teacher={teacher} onUpdate={handleUpdate} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}