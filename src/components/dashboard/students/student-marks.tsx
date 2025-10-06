'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';

// Define types
interface Country {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
  countryId: number;
  countryName: string;
}

interface Student {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  currentLevel: string;
  state: string;
  district: string;
  center: string;
  teacherFirstName: string;
  teacherLastName: string;
  levelWiseMark: Record<string, number>;
}

interface Level {
  id: number;
  name: string;
}

export function StudentMarks(): React.JSX.Element {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>('');
  const [selectedState, setSelectedState] = React.useState<string>('');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [loadingCountries, setLoadingCountries] = React.useState<boolean>(false);
  const [loadingStates, setLoadingStates] = React.useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = React.useState<boolean>(false);
  const [loadingLevels, setLoadingLevels] = React.useState<boolean>(false);
  const [savingMarks, setSavingMarks] = React.useState<boolean>(false);
  // State to track marks for each student and level
  const [studentMarks, setStudentMarks] = React.useState<Record<string, Record<string, number>>>({});

  // Fetch all countries on component mount
  React.useEffect(() => {
    fetchCountries();
    fetchLevels();
  }, []);

  // Fetch states when country changes
  React.useEffect(() => {
    if (selectedCountry) {
      fetchStatesByName(selectedCountry);
    } else {
      setStates([]);
      setSelectedState('');
      setStudents([]);
    }
  }, [selectedCountry]);

  // Fetch students when state changes
  React.useEffect(() => {
    if (selectedState) {
      fetchStudentsByState(selectedState);
    } else {
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [selectedState]);

  // Filter students based on search term
  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(student => {
        const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.toLowerCase();
        return fullName.includes(term);
      });
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Initialize student marks when students change
  React.useEffect(() => {
    const initialStudentMarks: Record<string, Record<string, number>> = {};
    students.forEach(student => {
      initialStudentMarks[student.id.toString()] = { ...student.levelWiseMark };
    });
    setStudentMarks(initialStudentMarks);
  }, [students]);

  // Fetch all countries
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await apiClient.get<Country[]>('/countries');
      setCountries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch countries. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states for a specific country by name
  const fetchStatesByName = async (countryName: string) => {
    setLoadingStates(true);
    setStates([]);
    setSelectedState('');
    setStudents([]);
    setSearchTerm('');
    try {
      const response = await apiClient.get<State[]>(`/states/countryName/${countryName}`);
      setStates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch states. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch students by state name
  const fetchStudentsByState = async (stateName: string) => {
    setLoadingStudents(true);
    setStudents([]);
    setSearchTerm('');
    try {
      const response = await apiClient.get<Student[]>(`/students/state/${stateName}`);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch students. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch all levels
  const fetchLevels = async () => {
    setLoadingLevels(true);
    try {
      const response = await apiClient.get<Level[]>('/levels');
      // Convert names to uppercase for display
      const levelsWithUpperCaseNames = response.data.map(level => ({
        ...level,
        name: level.name.toUpperCase()
      }));
      setLevels(levelsWithUpperCaseNames);
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch levels. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingLevels(false);
    }
  };

  // Handle mark change for a specific student and level
  const handleMarkChange = (studentId: number, level: string, mark: number) => {
    setStudentMarks(prev => {
      const studentIdStr = studentId.toString();
      const updatedStudentMarks = { ...prev };
      
      if (!updatedStudentMarks[studentIdStr]) {
        updatedStudentMarks[studentIdStr] = {};
      }
      
      updatedStudentMarks[studentIdStr] = {
        ...updatedStudentMarks[studentIdStr],
        [level]: mark
      };
      
      return updatedStudentMarks;
    });
  };

  // Save marks for a specific student
  const handleSaveMarks = async (studentId: number) => {
    const marksToSave = studentMarks[studentId.toString()];
    
    if (!marksToSave) {
      Swal.fire({
        title: 'Warning!',
        text: 'No marks to save.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setSavingMarks(true);
    try {
      await apiClient.put(`/students/${studentId}/marks`, marksToSave);
      
      Swal.fire({
        title: 'Success!',
        text: 'Student marks saved successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Refresh the student list
      if (selectedState) {
        fetchStudentsByState(selectedState);
      }
    } catch (error: any) {
      console.error('Error saving student marks:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save student marks. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSavingMarks(false);
    }
  };

  const handleCountryChange = (event: any) => {
    setSelectedCountry(event.target.value);
  };

  const handleStateChange = (event: any) => {
    setSelectedState(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Card>
      <CardHeader title="Student Marks Management" />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {/* Country Selection */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Select Location</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel required>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={handleCountryChange}
                  disabled={loadingCountries}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.id} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth disabled={!selectedCountry}>
                <InputLabel required>State</InputLabel>
                <Select
                  value={selectedState}
                  label="State"
                  onChange={handleStateChange}
                  disabled={!selectedCountry || loadingStates}
                >
                  {states.map((state) => (
                    <MenuItem key={state.id} value={state.name}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {/* Search Box */}
          {selectedState && (
            <Box>
              <TextField
                fullWidth
                label="Search Students"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by student name..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass fontSize="var(--icon-fontSize-md)" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
          
          {/* Students Table */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Students List {selectedState && `in ${selectedState}`}
              {searchTerm && ` (filtered by: "${searchTerm}")`}
            </Typography>
            
            {loadingStudents ? (
              <Typography>Loading students...</Typography>
            ) : filteredStudents.length === 0 ? (
              <Typography>No students found.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: '800px' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Current Level</TableCell>
                      <TableCell>District</TableCell>
                      <TableCell>Center</TableCell>
                      <TableCell>Teacher</TableCell>
                      {levels.map(level => (
                        <TableCell key={level.id} align="center">
                          {level.name}
                        </TableCell>
                      ))}
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
                      const teacherName = `${student.teacherFirstName} ${student.teacherLastName}`;
                      return (
                        <TableRow hover key={student.id}>
                          <TableCell>
                            <Stack>
                              <Typography variant="subtitle2">{fullName}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                ID: {student.id}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{student.currentLevel}</TableCell>
                          <TableCell>{student.district}</TableCell>
                          <TableCell>{student.center}</TableCell>
                          <TableCell>{teacherName}</TableCell>
                          {levels.map(level => (
                            <TableCell key={level.id} align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {student.currentLevel === level.name && (
                                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                                    (Current)
                                  </Typography>
                                )}
                                <TextField
                                  type="number"
                                  size="small"
                                  value={studentMarks[student.id.toString()]?.[level.name] || student.levelWiseMark?.[level.name] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : Number(e.target.value);
                                    if (value === '' || (typeof value === 'number' && value >= 0 && value <= 100)) {
                                      handleMarkChange(student.id, level.name, value === '' ? 0 : value);
                                    }
                                  }}
                                  InputProps={{
                                    inputProps: { 
                                      min: 0, 
                                      max: 100 
                                    }
                                  }}
                                  sx={{ width: 80 }}
                                />
                              </Box>
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              disabled={savingMarks}
                              onClick={() => handleSaveMarks(student.id)}
                            >
                              {savingMarks ? 'Saving...' : 'Save'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}