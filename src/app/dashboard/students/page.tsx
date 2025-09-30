import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { config } from '@/config';

export const metadata = { title: `Manage Students | Admin Dashboard | ${config.site.name}` } satisfies Metadata;

// Dummy data for students
const dummyStudents = [
  {
    id: 1,
    name: 'John Doe',
    contact: 'john.doe@example.com',
    level: 'Grade 10',
    location: 'New York',
    teacher: 'Sarah Johnson',
  },
  {
    id: 2,
    name: 'Jane Smith',
    contact: 'jane.smith@example.com',
    level: 'Grade 8',
    location: 'California',
    teacher: 'Michael Brown',
  },
];

export default function StudentsPage(): React.JSX.Element {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Manage Students" />
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="search-students">
                      Search students by name, email, phone, standard, location...
                    </InputLabel>
                    <OutlinedInput
                      id="search-students"
                      startAdornment={
                        <InputAdornment position="start">
                          <MagnifyingGlassIcon />
                        </InputAdornment>
                      }
                      label="Search students by name, email, phone, standard, location..."
                    />
                  </FormControl>
                </Box>
                
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Level</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Teacher</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dummyStudents.length > 0 ? (
                        dummyStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.id}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.contact}</TableCell>
                            <TableCell>{student.level}</TableCell>
                            <TableCell>{student.location}</TableCell>
                            <TableCell>{student.teacher}</TableCell>
                            <TableCell>
                              <TextField size="small" placeholder="Actions" variant="outlined" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}