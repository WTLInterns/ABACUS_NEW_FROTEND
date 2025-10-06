'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';

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

export function StudentDetailsView(): React.JSX.Element {
  const router = useRouter();
  const { id } = useParams();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchStudentDetails(Number(id));
    }
  }, [id]);

  const fetchStudentDetails = async (studentId: number) => {
    try {
      const response = await apiClient.get<Student>(`/admin/students/${studentId}`);
      setStudent(response.data);
      setStatus(response.data.status || 'PENDING');
    } catch (error) {
      console.error('Error fetching student details:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch student details. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!student) return;

    setUpdating(true);
    try {
      await apiClient.put(`/admin/students/${student.id}/updateStatus`, { status });
      
      Swal.fire({
        title: 'Success!',
        text: 'Student status updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Update local state
      if (student) {
        setStudent({ ...student, status });
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update student status. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Student Details" />
        <Divider />
        <CardContent>
          <Typography>Loading student details...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardHeader title="Student Details" />
        <Divider />
        <CardContent>
          <Typography>Student not found.</Typography>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
  const teacherName = `${student.teacherFirstName} ${student.teacherLastName}`;
  const branchNames = student.branchNames ? student.branchNames.join(', ') : 'Not specified';

  return (
    <Card>
      <CardHeader title="Student Details" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">Personal Information</Typography>
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Gender"
              value={student.gender}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              value={student.dob}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Email"
              value={student.email}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              value={student.whatsappNumber}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          {/* Academic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>Academic Information</Typography>
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Enrollment Type"
              value={student.enrollMeantType}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Standard"
              value={student.std}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Current Level"
              value={student.currentLevel}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          {/* Address Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>Address Information</Typography>
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Country"
              value={student.country}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="State"
              value={student.state}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="District"
              value={student.district}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Taluka"
              value={student.taluka}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="City"
              value={student.city}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField
              fullWidth
              label="Center"
              value={student.center}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={student.address}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          {/* Teacher and Branch Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>Teacher & Branch Information</Typography>
          </Grid>
          
          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Teacher Name"
              value={teacherName}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Branch Names"
              value={branchNames}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          {/* Status Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>Status Information</Typography>
          </Grid>
          
          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Admission Date"
              value={student.addmissionDate}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid size={{ md: 6, xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
                disabled={student.status === 'APPROVED'}
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={handleBack}
              >
                Back
              </Button>
              
              {student.status !== 'APPROVED' && (
                <Button 
                  variant="contained" 
                  onClick={handleStatusUpdate}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}