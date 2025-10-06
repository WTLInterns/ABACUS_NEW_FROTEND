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
}

interface Level {
  id: number;
  name: string;
}

export function PromoteStudent(): React.JSX.Element {
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
  const [promoting, setPromoting] = React.useState<boolean>(false);
  // State to track selected level for each student
  const [selectedLevels, setSelectedLevels] = React.useState<Record<number, string>>({});

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

  // Update selected levels when students change
  React.useEffect(() => {
    const initialSelectedLevels: Record<number, string> = {};
    students.forEach(student => {
      initialSelectedLevels[student.id] = student.currentLevel;
    });
    setSelectedLevels(initialSelectedLevels);
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

  // Promote student to a new level
  const handlePromoteStudent = async (studentId: number) => {
    const selectedLevel = selectedLevels[studentId];
    
    if (!selectedLevel) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select a level to promote to.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setPromoting(true);
    try {
      await apiClient.put(`/students/${studentId}/promoteLevel`, { level: selectedLevel });
      
      Swal.fire({
        title: 'Success!',
        text: 'Student promoted successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Refresh the student list
      if (selectedState) {
        fetchStudentsByState(selectedState);
      }
      
      // Reset the selected level for this student
      setSelectedLevels(prev => {
        const newSelectedLevels = { ...prev };
        delete newSelectedLevels[studentId];
        return newSelectedLevels;
      });
    } catch (error: any) {
      console.error('Error promoting student:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to promote student. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setPromoting(false);
    }
  };

  // Handle level selection for a specific student
  const handleLevelChange = (studentId: number, level: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [studentId]: level
    }));
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
      <CardHeader title="Promote Students" />
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
                      <TableCell>Actions</TableCell>
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
                          <TableCell>
                            <FormControl fullWidth>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Select
                                  size="small"
                                  displayEmpty
                                  value={selectedLevels[student.id] || student.currentLevel || ''}
                                  onChange={(e) => handleLevelChange(student.id, e.target.value as string)}
                                  sx={{ minWidth: 120 }}
                                >
                                  <MenuItem value="" disabled>
                                    Select Level
                                  </MenuItem>
                                  {levels.map((level) => (
                                    <MenuItem key={level.id} value={level.name}>
                                      {level.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={promoting}
                                  onClick={() => handlePromoteStudent(student.id)}
                                >
                                  {promoting ? 'Promoting...' : 'Promote'}
                                </Button>
                              </Stack>
                            </FormControl>
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