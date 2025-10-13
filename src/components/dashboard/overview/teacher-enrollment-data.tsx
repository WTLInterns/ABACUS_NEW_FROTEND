import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import { ArrowsClockwise as SwapIcon } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';
import Typography from '@mui/material/Typography';

export interface TeacherEnrollment {
  teacherName: string;
  email: string;
  enrollmentType: string;
  count: string;
}

export interface TeacherEnrollmentDataProps {
  teachers?: TeacherEnrollment[];
  enrollmentType: 'ABACUS' | 'VEDIC-MATH';
  onToggleEnrollment?: () => void;
  sx?: SxProps;
}

export function TeacherEnrollmentData({ 
  teachers = [], 
  enrollmentType, 
  onToggleEnrollment,
  sx 
}: TeacherEnrollmentDataProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader 
        title="Teacher Enrollment Data" 
        subheader={`Showing data for ${enrollmentType}`}
        action={
          <IconButton onClick={onToggleEnrollment} aria-label="toggle enrollment">
            <SwapIcon />
          </IconButton>
        }
      />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>Teacher Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Enrollment Type</TableCell>
              <TableCell>Student Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher, index) => (
              <TableRow hover key={index}>
                <TableCell>{teacher.teacherName}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.enrollmentType}</TableCell>
                <TableCell>{teacher.count}</TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No teacher enrollment data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Current view: {enrollmentType} | Click icon to switch to {enrollmentType === 'ABACUS' ? 'VEDIC-MATH' : 'ABACUS'}
        </Typography>
      </Box>
    </Card>
  );
}