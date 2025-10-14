'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { EyeIcon, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';
import { useRouter } from 'next/navigation';

interface Student {
  id: number;
  enrollMeantType: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  whatsappNumber: string;
  dob: string;
  addmissionDate: string;
  std: string;
  currentLevel: string;
  center: string;
  state: string;
  district: string;
  address: string;
  city: string;
  email: string;
  country: string;
  taluka: string;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  status: string;
  branchNames: string[];
}

export function ManageStudents(): React.JSX.Element {
  const router = useRouter();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on status and search term
  React.useEffect(() => {
    let result = students;
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(student => student.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(result);
    setPage(0); // Reset to first page when filtering
  }, [students, statusFilter, searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Student[]>('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch students. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (studentId: number) => {
    router.push(`/dashboard/admin/students/${studentId}`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredStudents.length) : 0;

  const visibleRows = React.useMemo(
    () => filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredStudents, page, rowsPerPage],
  );

  if (loading) {
    return (
      <Card>
        <CardHeader title="Manage Students" />
        <Divider />
        <CardContent>
          <Typography>Loading students...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Manage Students" />
      <Divider />
      <CardContent>
        {/* Filter Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant={statusFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('ALL')}
            >
              All Students
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'APPROVED' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved
            </Button>
          </Stack>
          
          {/* Search Field */}
          <TextField
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlass />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Enrollment Type</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>Current Level</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((student) => {
                const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
                const teacherName = `${student.teacherFirstName} ${student.teacherLastName}`;
                return (
                  <TableRow hover key={student.id}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2">{fullName}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          ID: {student.id}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{student.enrollMeantType}</TableCell>
                    <TableCell>{student.std}</TableCell>
                    <TableCell>{student.currentLevel}</TableCell>
                    <TableCell>{student.center}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.whatsappNumber}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {student.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: student.status === 'APPROVED' ? 'success.main' : 'warning.main'
                        }}
                      >
                        {student.status || 'PENDING'}
                      </Typography>
                    </TableCell>
                    <TableCell>{teacherName}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewDetails(student.id)}
                      >
                        <EyeIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={filteredStudents.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardContent>
    </Card>
  );
}