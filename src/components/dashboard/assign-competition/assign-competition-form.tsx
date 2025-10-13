'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { MagnifyingGlass, CaretDown, CaretUp, CalendarBlank, Trophy } from '@phosphor-icons/react/dist/ssr';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';

// Define the student type
interface Student {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  currentLevel: string;
  std: string;
  center: string;
  status: string;
  competitions?: Competition[]; // Add competitions array to student
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

export function AssignCompetitionForm(): React.JSX.Element {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [competitions, setCompetitions] = React.useState<Competition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [teacherId, setTeacherId] = React.useState<number | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  // Get teacher ID from localStorage on component mount
  React.useEffect(() => {
    const userDataString = localStorage.getItem('user-data');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = parseInt(userData.id, 10);
        setTeacherId(id);
        fetchStudents(id);
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

  // Filter students based on search term
  React.useEffect(() => {
    // First filter by approved status
    let result = students.filter(student => student.status === 'APPROVED');
    
    // Then apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.whatsappNumber.includes(term)
      );
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm]);

  const fetchStudents = async (id: number) => {
    setLoading(true);
    try {
      const response = await apiClient.get<Student[]>(`/students/teacher/${id}/approved`);
      setStudents(response.data);
      setFilteredStudents(response.data);
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

  const handleToggleRow = (studentId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleAssignCompetition = async (studentId: number, competitionId: number, competitionName: string) => {
    try {
      // Call the API to assign competition to student
      await apiClient.post(`/competition/assignStudent/${studentId}/${competitionId}`);
      
      // Refresh student data after assignment
      if (teacherId) {
        fetchStudents(teacherId);
      }
      
      Swal.fire({
        title: 'Success!',
        text: `Competition "${competitionName}" assigned successfully!`,
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

  // Check if student is already enrolled in a competition
  const isStudentEnrolledInCompetition = (student: Student, competitionId: number): boolean => {
    if (!student.competitions || student.competitions.length === 0) {
      return false;
    }
    return student.competitions.some(comp => comp.id === competitionId);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Approved Students" />
            <Divider />
            <CardContent>
              <Typography>Loading students...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Student List Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader 
            title="Approved Students" 
            subheader="List of students with approved status"
          />
          <Divider />
          <CardContent>
            {/* Search Field */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField
                placeholder="Search approved students..."
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
                    <TableCell width="50px" />
                    <TableCell>Student Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>Center</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
                    const isExpanded = expandedRows.has(student.id);
                    const activeCompetitions = competitions.filter(comp => comp.status === 'ACTIVE');
                    
                    return (
                      <React.Fragment key={student.id}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleRow(student.id)}
                              sx={{ 
                                transition: 'all 0.3s',
                                color: isExpanded ? 'primary.main' : 'text.secondary'
                              }}
                            >
                              {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Stack sx={{ alignItems: 'flex-start' }}>
                              <Typography variant="subtitle2">{fullName}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                ID: {student.id}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{student.whatsappNumber}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {student.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{student.currentLevel}</TableCell>
                          <TableCell>{student.std}</TableCell>
                          <TableCell>{student.center}</TableCell>
                          <TableCell>
                            <Chip 
                              label={student.status || 'PENDING'}
                              color="success"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2 }}>
                                <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <Trophy size={24} weight="fill" color="#f59e0b" />
                                  Available Competitions
                                </Typography>
                                {activeCompetitions.length === 0 ? (
                                  <Typography color="text.secondary" sx={{ py: 2 }}>
                                    No active competitions available at the moment.
                                  </Typography>
                                ) : (
                                  <Grid container spacing={2}>
                                    {activeCompetitions.map((competition) => {
                                      const registrationDate = new Date(competition.registrationLastDate);
                                      const currentDate = new Date();
                                      const isRegistrationClosed = currentDate > registrationDate;
                                      const isAlreadyEnrolled = isStudentEnrolledInCompetition(student, competition.id);
                                      
                                      return (
                                        <Grid key={competition.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                          <Card 
                                            sx={{ 
                                              height: '100%',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              transition: 'all 0.3s',
                                              opacity: isRegistrationClosed ? 0.7 : 1,
                                              '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4
                                              }
                                            }}
                                          >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                              <Stack spacing={1.5}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {competition.competitionName}
                                                  </Typography>
                                                  <Chip 
                                                    label={competition.status}
                                                    color="success"
                                                    size="small"
                                                  />
                                                </Box>
                                                
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                                  {competition.heading}
                                                </Typography>
                                                
                                                <Typography variant="body2" color="text.secondary" sx={{ 
                                                  display: '-webkit-box',
                                                  WebkitLineClamp: 2,
                                                  WebkitBoxOrient: 'vertical',
                                                  overflow: 'hidden'
                                                }}>
                                                  {competition.description}
                                                </Typography>
                                                
                                                <Divider />
                                                
                                                <Stack spacing={0.5}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CalendarBlank size={16} />
                                                    <Typography 
                                                      variant="caption" 
                                                      color={isRegistrationClosed ? 'error' : 'text.secondary'}
                                                      sx={{ fontWeight: isRegistrationClosed ? 'bold' : 'normal' }}
                                                    >
                                                      Registration: {registrationDate.toLocaleDateString()}
                                                      {isRegistrationClosed && ' (Closed)'}
                                                    </Typography>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CalendarBlank size={16} />
                                                    <Typography variant="caption" color="text.secondary">
                                                      Start: {new Date(competition.startDate).toLocaleDateString()}
                                                    </Typography>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CalendarBlank size={16} />
                                                    <Typography variant="caption" color="text.secondary">
                                                      End: {new Date(competition.endDate).toLocaleDateString()}
                                                    </Typography>
                                                  </Box>
                                                </Stack>
                                                
                                                {isRegistrationClosed ? (
                                                  <Chip 
                                                    label="Registration Closed"
                                                    color="error"
                                                    size="small"
                                                    sx={{ mt: 1, fontWeight: 'bold' }}
                                                  />
                                                ) : isAlreadyEnrolled ? (
                                                  <Chip 
                                                    label="Already Enrolled"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mt: 1, fontWeight: 'bold' }}
                                                  />
                                                ) : (
                                                  <Button 
                                                    variant="contained" 
                                                    fullWidth
                                                    size="small"
                                                    onClick={() => handleAssignCompetition(student.id, competition.id, competition.competitionName)}
                                                    sx={{ mt: 1 }}
                                                  >
                                                    Assign Competition
                                                  </Button>
                                                )}
                                              </Stack>
                                            </CardContent>
                                          </Card>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}