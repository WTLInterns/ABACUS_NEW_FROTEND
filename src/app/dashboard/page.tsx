'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ArrowsClockwise as SwapIcon } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Book as BookIcon } from '@phosphor-icons/react/dist/ssr/Book';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Package as PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';

import { TeacherEnrollmentData, TeacherEnrollment } from '@/components/dashboard/overview/teacher-enrollment-data';
import apiClient from '@/services/api';

export default function Page(): React.JSX.Element {
  const [teacherCount, setTeacherCount] = React.useState<string>('0');
  const [enrollmentCount, setEnrollmentCount] = React.useState<string>('0');
  const [enrollmentType, setEnrollmentType] = React.useState<'ABACUS' | 'VEDIC-MATH'>('ABACUS');
  const [statusCount, setStatusCount] = React.useState<string>('0');
  const [statusType, setStatusType] = React.useState<'APPROVED' | 'PENDING'>('APPROVED');
  const [inventoryCount, setInventoryCount] = React.useState<string>('0');
  const [teacherEnrollmentData, setTeacherEnrollmentData] = React.useState<TeacherEnrollment[]>([]);
  const [teacherEnrollmentType, setTeacherEnrollmentType] = React.useState<'ABACUS' | 'VEDIC-MATH'>('ABACUS');

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get master admin ID from localStorage
        const userDataString = localStorage.getItem('user-data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const masterAdminId = Number.parseInt(userData.id, 10);
          
          // Fetch teacher count
          const teacherResponse = await apiClient.get(`/dashboard/teacherCount/${masterAdminId}`);
          setTeacherCount(teacherResponse.data || '0');
          
          // Fetch student count by enrollment type
          const enrollmentResponse = await apiClient.get(`/dashboard/studentCountByEnrollmentTypeByMasterAdminId/${masterAdminId}/${enrollmentType}`);
          setEnrollmentCount(enrollmentResponse.data || '0');
          
          // Fetch student count by status
          const statusResponse = await apiClient.get(`/dashboard/studentCountByStatusByMasterAdminId/${masterAdminId}/${statusType}`);
          setStatusCount(statusResponse.data || '0');
          
          // Fetch inventory count
          const inventoryResponse = await apiClient.get(`/dashboard/inventoryCountCount/${masterAdminId}`);
          setInventoryCount(inventoryResponse.data || '0');
          
          // Fetch teacher enrollment data
          const teacherEnrollmentResponse = await apiClient.get(`/dashboard/studentEnrollmentTypeCountWithTeacher/${masterAdminId}/${teacherEnrollmentType}`);
          setTeacherEnrollmentData(teacherEnrollmentResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [enrollmentType, statusType, teacherEnrollmentType]);

  const handleToggleEnrollment = () => {
    setEnrollmentType(enrollmentType === 'ABACUS' ? 'VEDIC-MATH' : 'ABACUS');
  };

  const handleToggleStatus = () => {
    setStatusType(statusType === 'APPROVED' ? 'PENDING' : 'APPROVED');
  };

  const handleToggleTeacherEnrollment = () => {
    setTeacherEnrollmentType(teacherEnrollmentType === 'ABACUS' ? 'VEDIC-MATH' : 'ABACUS');
  };

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            avatar={<UsersIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Total Teachers" 
            subheader="Active instructors"
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {teacherCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Qualified educators
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            avatar={<BookIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Student Enrollment" 
            subheader={`Viewing ${enrollmentType} students`}
            action={
              <IconButton onClick={handleToggleEnrollment} aria-label="toggle enrollment">
                <SwapIcon />
              </IconButton>
            }
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {enrollmentCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {enrollmentType} program enrollees
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Switch to {enrollmentType === 'ABACUS' ? 'VEDIC-MATH' : 'ABACUS'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            avatar={<CheckCircleIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Student Status" 
            subheader={`Viewing ${statusType} students`}
            action={
              <IconButton onClick={handleToggleStatus} aria-label="toggle status">
                <SwapIcon />
              </IconButton>
            }
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {statusCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {statusType.toLowerCase()} student records
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Switch to {statusType === 'APPROVED' ? 'PENDING' : 'APPROVED'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            avatar={<PackageIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Inventory Items" 
            subheader="Available resources"
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {inventoryCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Teaching materials
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          xs: 12,
        }}
      >
        <TeacherEnrollmentData 
          teachers={teacherEnrollmentData}
          enrollmentType={teacherEnrollmentType}
          onToggleEnrollment={handleToggleTeacherEnrollment}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}