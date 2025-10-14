import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  enrollMeantType: string;
  currentLevel: string;
}

export interface StudentEnrollmentDataProps {
  students?: Student[];
  enrollmentType: string;
  sx?: SxProps;
}

export function StudentEnrollmentData({ students = [], enrollmentType, sx }: StudentEnrollmentDataProps): React.JSX.Element {
  const theme = useTheme();
  
  const statusMap: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
    PENDING: { label: 'Pending', color: 'warning' },
    APPROVED: { label: 'Approved', color: 'success' },
    REJECTED: { label: 'Rejected', color: 'error' },
    ENROLLED: { label: 'Enrolled', color: 'success' },
  };

  return (
    <Card sx={sx}>
      <CardHeader title={`${enrollmentType} Students`} />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const { label, color } = statusMap[student.status] || { label: student.status, color: 'default' };

              return (
                <TableRow hover key={student.id}>
                  <TableCell>#{student.id}</TableCell>
                  <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                  <TableCell>{student.currentLevel}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}