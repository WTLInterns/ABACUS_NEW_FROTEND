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
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Book as BookIcon } from '@phosphor-icons/react/dist/ssr/Book';
import { CurrencyInr as CurrencyIcon } from '@phosphor-icons/react/dist/ssr/CurrencyInr';
import { GraduationCap as LevelIcon } from '@phosphor-icons/react/dist/ssr/GraduationCap';

import { Budget } from '@/components/dashboard/overview/budget';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { StudentEnrollmentData } from '@/components/dashboard/overview/student-enrollment-data';
// import { StudentLevels } from '@/components/dashboard/overview/student-levels';
import apiClient from '@/services/api';

export default function TeacherOverviewPage(): React.JSX.Element {
  const [abacusStudents, setAbacusStudents] = React.useState<any[]>([]);
  const [vedicMathStudents, setVedicMathStudents] = React.useState<any[]>([]);
  const [totalStudents, setTotalStudents] = React.useState<string>('0');
  const [enrollmentCount, setEnrollmentCount] = React.useState<string>('0');
  const [enrollmentType, setEnrollmentType] = React.useState<'ABACUS' | 'VEDIC-MATH'>('ABACUS');
  const [statusCount, setStatusCount] = React.useState<string>('0');
  const [statusType, setStatusType] = React.useState<'APPROVED' | 'PENDING'>('APPROVED');
  const [outstandingPrice, setOutstandingPrice] = React.useState<string>('0');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get teacher ID from localStorage
        const userDataString = localStorage.getItem('user-data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const teacherId = parseInt(userData.id, 10);
          
          // Fetch total student count
          const countResponse = await apiClient.get(`/dashboard/studentcount/${teacherId}`);
          setTotalStudents(countResponse.data || '0');
          
          // Fetch student count by enrollment type (initially ABACUS)
          const enrollmentResponse = await apiClient.get(`/dashboard/studentEnrollMentTypeCount/${teacherId}/${enrollmentType}`);
          setEnrollmentCount(enrollmentResponse.data || '0');
          
          // Fetch student count by status (initially APPROVED)
          const statusResponse = await apiClient.get(`/dashboard/student-status-count/${teacherId}/${statusType}`);
          setStatusCount(statusResponse.data || '0');
          
          // Fetch outstanding price
          const outstandingResponse = await apiClient.get(`/ledger/outstanding-price/${teacherId}`);
          setOutstandingPrice(outstandingResponse.data || '0');
          
          // Fetch ABACUS students
          const abacusResponse = await apiClient.get(`/dashboard/by-enrollment-type/${teacherId}/ABACUS`);
          setAbacusStudents(abacusResponse.data || []);
          
          // Fetch VEDIC MATH students
          const vedicMathResponse = await apiClient.get(`/dashboard/by-enrollment-type/${teacherId}/VEDIC-MATH`);
          setVedicMathStudents(vedicMathResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [enrollmentType, statusType]);

  const handleToggleEnrollment = () => {
    setEnrollmentType(enrollmentType === 'ABACUS' ? 'VEDIC-MATH' : 'ABACUS');
  };

  const handleToggleStatus = () => {
    setStatusType(statusType === 'APPROVED' ? 'PENDING' : 'APPROVED');
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
            title="Total Students" 
            subheader="Your enrolled students"
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {totalStudents}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Active learners
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
            avatar={<BookIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Enrollment Type" 
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
            avatar={<CurrencyIcon fontSize="var(--Icon-fontSize,20px)" />}
            title="Outstanding Amount" 
            subheader="Pending payments"
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" component="div" gutterBottom>
              ₹{outstandingPrice}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Total pending fees
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          lg: 6,
          md: 12,
          xs: 12,
        }}
      >
        <StudentEnrollmentData
          students={abacusStudents}
          enrollmentType="ABACUS"
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid
        size={{
          lg: 6,
          md: 12,
          xs: 12,
        }}
      >
        <StudentEnrollmentData
          students={vedicMathStudents}
          enrollmentType="VEDIC MATH"
          sx={{ height: '100%' }}
        />
      </Grid>
      {/* <Grid
        size={{
          xs: 12,
        }}
      >
        <StudentLevels
          students={enrollmentType === 'ABACUS' ? abacusStudents : vedicMathStudents}
          enrollmentType={enrollmentType}
          onToggleEnrollment={handleToggleEnrollment}
          sx={{ height: '100%' }}
        />
      </Grid> */}
    </Grid>
  );
}