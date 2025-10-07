'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import apiClient from '@/services/api';

interface Student {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  currentLevel: string;
  center: string;
  teacherFirstName: string;
  teacherLastName: string;
}

export function CertificateSection(): React.JSX.Element {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<number | ''>('');
  const [studentName, setStudentName] = React.useState<string>('');
  const [marks, setMarks] = React.useState<string>('');
  const [level, setLevel] = React.useState<string>('');
  const [loadingStudents, setLoadingStudents] = React.useState<boolean>(false);
  const certificateRef = React.useRef<HTMLDivElement>(null);

  // Fetch students on component mount
  React.useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students for the teacher
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // Get teacher ID from localStorage
      const userDataString = localStorage.getItem('user-data');
      if (!userDataString) {
        throw new Error('User data not found in localStorage');
      }
      
      const userData = JSON.parse(userDataString);
      const teacherId = userData.id;
      
      const response = await apiClient.get<Student[]>(`/students/teacher/${teacherId}`);
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

  // Handle student selection
  const handleStudentChange = (event: any) => {
    const studentId = event.target.value;
    setSelectedStudent(studentId);
    
    // Find the selected student and populate the fields
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setStudentName(`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`);
        setLevel(student.currentLevel);
        // Marks would need to be fetched separately or entered manually
        setMarks('');
      }
    } else {
      setStudentName('');
      setLevel('');
      setMarks('');
    }
  };

  const handleDownloadJPG = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: true,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = 'certificate.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } catch (err: any) {
        console.error('Error generating JPG:', err);
        Swal.fire({
          title: 'Error!',
          text: `Error generating JPG. Please try again.
          
Note: For local files, right-click the download button and select "Save Link As..."
          
Technical details: ${err.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const orientation = imgWidth > imgHeight ? 'l' : 'p';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [imgWidth, imgHeight]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save('certificate.pdf');
      } catch (err: any) {
        console.error('Error generating PDF:', err);
        Swal.fire({
          title: 'Error!',
          text: `Error generating PDF. Please try again.
          
Note: For local files, you may need to run this from a web server.
          
Technical details: ${err.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Certificate Generation" />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="body1">
            Generate certificates for students based on their performance and achievements.
          </Typography>
          
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel required>Select Student</InputLabel>
                <Select
                  value={selectedStudent}
                  label="Select Student"
                  onChange={handleStudentChange}
                  disabled={loadingStudents}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName} (${student.currentLevel})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g., 95%"
              />
              <TextField
                fullWidth
                label="Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadJPG}
              >
                Download as JPG
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDownloadPDF}
              >
                Download as PDF
              </Button>
            </Stack>
          </Box>
          
           {/* Certificate Preview */}
          <Box sx={{ overflow: 'auto', maxHeight: '600px' }}>
            <div 
              ref={certificateRef}
              style={{
                backgroundImage: "url('/certificate.jpg')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '100%',
                height: '500px',
                position: 'relative',
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '56%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#630000',
                  fontFamily: 'serif',
                  textAlign: 'center',
                  width: '80%'
                }}
              >
                {studentName}
              </div>
              
              <div
                style={{
                  position: 'absolute',
                  top: '73%',
                  left: '40%',
                  transform: 'translateX(-50%)',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#630000',
                  fontFamily: 'serif',
                  textAlign: 'center',
                  width: '80%'
                }}
              >
                {marks}
              </div>
              
              <div
                style={{
                  position: 'absolute',
                  top: '61.4%',
                  left: '51.2%',
                  transform: 'translateX(-50%)',
                  fontSize: '5px',
                  fontWeight: 'bold',
                  color: '#630000',
                  fontFamily: 'serif',
                  textAlign: 'center',
                  width: '80%'
                }}
              >
                {level}
              </div>
              
              <img
                src="/sign.png"
                alt="Director's Signature"
                style={{
                  position: 'absolute',
                  top: '79%',
                  right: '44%',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}