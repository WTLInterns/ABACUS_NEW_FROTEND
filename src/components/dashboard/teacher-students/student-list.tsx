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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { PencilIcon, TrashIcon, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';
import { EditStudentForm } from './edit-student-form';
import eventEmitter from '@/lib/events';

// Define the student type
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
}

// Define the competition type
interface Competition {
  id: number;
  competitionName: string;
  heading: string;
  description: string;
  registrationLastDate: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function StudentList(): React.JSX.Element {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [teacherId, setTeacherId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [loading, setLoading] = React.useState(true);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'APPROVED'>('APPROVED'); // Changed default to APPROVED
  const [competitions, setCompetitions] = React.useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = React.useState<{[key: number]: number | null}>({});

  // Get teacher ID from localStorage on component mount
  React.useEffect(() => {
    const userDataString = localStorage.getItem('user-data');
    if (userDataString) {
      try {
        const userData: UserData = JSON.parse(userDataString);
        const id = Number.parseInt(userData.id, 10);
        setTeacherId(id);
        
        // Fetch students for this teacher (only approved by default)
        fetchStudents(id);
        
        // Fetch all competitions
        fetchCompetitions();
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to retrieve teacher information. Please log in again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Teacher information not found. Please log in again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
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

  // Listen for student creation and update events
  React.useEffect(() => {
    const handleStudentCreated = () => {
      // Refresh the student list when a new student is created
      if (teacherId) {
        fetchStudents(teacherId);
      }
    };

    const handleStudentUpdated = () => {
      // Refresh the student list when a student is updated
      if (teacherId) {
        fetchStudents(teacherId);
      }
    };

    eventEmitter.on('studentCreated', handleStudentCreated);
    eventEmitter.on('studentUpdated', handleStudentUpdated);
    
    // Cleanup event listeners on component unmount
    return () => {
      eventEmitter.off('studentCreated', handleStudentCreated);
      eventEmitter.off('studentUpdated', handleStudentUpdated);
    };
  }, [teacherId]);

  const fetchStudents = async (id: number) => {
    setLoading(true);
    try {
      // Fetch only approved students by default
      const endpoint = statusFilter === 'APPROVED' 
        ? `/students/teacher/${id}/approved`
        : `/students/teacher/${id}`;
      
      const response = await apiClient.get<Student[]>(endpoint);
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

  const fetchCompetitions = async () => {
    try {
      const response = await apiClient.get<Competition[]>('/competition/getAllCompetition');
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch competitions. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (studentId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/students/${studentId}`);
          // Remove the deleted student from the state immediately
          setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
          setFilteredStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
          // Also update the visible rows if necessary
          setPage(0); // Reset to first page to avoid empty pages
          Swal.fire(
            'Deleted!',
            'Student has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting student:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete student. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleEditSuccess = () => {
    setEditingStudent(null);
    // Refresh the student list
    if (teacherId) {
      fetchStudents(teacherId);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle competition selection for a student
  const handleCompetitionChange = (studentId: number, competitionId: number) => {
    setSelectedCompetition(prev => ({
      ...prev,
      [studentId]: competitionId
    }));
  };

  // Assign competition to student
  const handleAssignCompetition = async (studentId: number) => {
    const competitionId = selectedCompetition[studentId];
    
    if (!competitionId) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a competition first.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      await apiClient.put(`/competition/${studentId}/${competitionId}/assign`);
      Swal.fire({
        title: 'Success!',
        text: 'Competition assigned to student successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error assigning competition:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to assign competition. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
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

  if (editingStudent) {
    return (
      <EditStudentForm 
        student={editingStudent} 
        onCancel={handleCancelEdit} 
        onSuccess={handleEditSuccess} 
      />
    );
  }

  return (
    <Card>
      <CardHeader title="Manage Students" />
      <Divider />
      <CardContent>
        {/* Filter Buttons and Search */}
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
                <TableCell>Name</TableCell>
                <TableCell>Enrollment Type</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>Current Level</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assign Competition</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((student) => {
                const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
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
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel id={`competition-label-${student.id}`}>Competition</InputLabel>
                          <Select
                            labelId={`competition-label-${student.id}`}
                            value={selectedCompetition[student.id] || ''}
                            label="Competition"
                            onChange={(e) => handleCompetitionChange(student.id, Number(e.target.value))}
                          >
                            <MenuItem value="">
                              <em>Select Competition</em>
                            </MenuItem>
                            {competitions.map((competition) => (
                              <MenuItem key={competition.id} value={competition.id}>
                                {competition.competitionName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleAssignCompetition(student.id)}
                        >
                          Assign
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(student)}
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(student.id)}
                        >
                          <TrashIcon />
                        </IconButton>
                      </Stack>
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