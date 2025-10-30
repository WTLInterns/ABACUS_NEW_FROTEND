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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import apiClient from '@/services/api';

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
  center: string;
  teacherFirstName: string;
  teacherLastName: string;
  country: string;
  state: string;
  district: string;
}

interface StudentLevelMark {
  studentName: string;
  level: string;
  marks: string;
}

export function CertificateSection(): React.JSX.Element {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [studentLevelMarks, setStudentLevelMarks] = React.useState<StudentLevelMark[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>('');
  const [selectedState, setSelectedState] = React.useState<string>('');
  const [selectedStudent, setSelectedStudent] = React.useState<number | null>(null);
  const [selectedLevelMark, setSelectedLevelMark] = React.useState<number | null>(null);
  const [studentName, setStudentName] = React.useState<string>('');
  const [marks, setMarks] = React.useState<string>('');
  const [level, setLevel] = React.useState<string>('');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [loadingCountries, setLoadingCountries] = React.useState<boolean>(false);
  const [loadingStates, setLoadingStates] = React.useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = React.useState<boolean>(false);
  const [loadingLevelMarks, setLoadingLevelMarks] = React.useState<boolean>(false);
  const [levelLeftPosition, setLevelLeftPosition] = React.useState<number>(58);
  const certificateRef = React.useRef<HTMLDivElement>(null);

  // Fetch countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  React.useEffect(() => {
    if (selectedCountry) {
      fetchStatesByName(selectedCountry);
    } else {
      setStates([]);
      setSelectedState('');
      setStudents([]);
      setFilteredStudents([]);
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

  // Fetch level marks for selected student
  const fetchStudentLevelMarks = async (studentId: number) => {
    if (studentId === null || studentId === undefined) return;
    
    setLoadingLevelMarks(true);
    try {
      const response = await apiClient.get<StudentLevelMark[]>(`/students/${studentId}/levels-marks`);
      setStudentLevelMarks(Array.isArray(response.data) ? response.data : []);
      setSelectedLevelMark(null);
      setLevel('');
      setMarks('');
    } catch (error) {
      console.error('Error fetching student level marks:', error);
      setStudentLevelMarks([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch student level marks. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingLevelMarks(false);
    }
  };

  // Handle country selection
  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCountry(event.target.value);
  };

  // Handle state selection
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    setSelectedState(event.target.value);
  };

  // Handle student selection
  const handleStudentChange = (event: SelectChangeEvent<number | ''>) => {
    const studentId = event.target.value === '' ? null : event.target.value as number;
    setSelectedStudent(studentId);
    setSelectedLevelMark(null);
    
    // Find the selected student and populate the fields
    if (studentId !== null && studentId !== undefined) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setStudentName(`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`);
        // Fetch level marks for this student
        fetchStudentLevelMarks(studentId);
      }
    } else {
      setStudentName('');
      setStudentLevelMarks([]);
      setLevel('');
      setMarks('');
    }
  };

  // Handle level mark selection
  const handleLevelMarkChange = (event: SelectChangeEvent<number | ''>) => {
    const index = event.target.value === '' ? null : event.target.value as number;
    setSelectedLevelMark(index);
    
    // Find the selected level mark and populate the fields
    if (index >= 0 && index < studentLevelMarks.length) {
      const selected = studentLevelMarks[index];
      setLevel(selected.level);
      setMarks(selected.marks || '');
    } else {
      setLevel('');
      setMarks('');
    }
  };

  // Download certificate with exact preview appearance but maximum resolution
  const handleDownloadCertificate = async (format: 'jpg' | 'pdf') => {
    if (certificateRef.current) {
      try {
        // Validate required fields
        if (selectedStudent === null) {
          Swal.fire({
            title: 'Error!',
            text: 'Please select a student.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
        
        if (studentLevelMarks.length > 0 && selectedLevelMark === null) {
          Swal.fire({
            title: 'Error!',
            text: 'Please select a level.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        // Show loading indicator
        const loadingSwal = Swal.fire({
          title: 'Generating Certificate...',
          text: 'Please wait while we create your extremely high-quality certificate.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Preload the SVG to ensure it's available for html2canvas
        const preloadImage = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => reject(new Error('Failed to load certificate background')));
          img.src = '/Abacus_Certificate.svg';
        });

        // Wait for the image to load
        await preloadImage;

        // Use html2canvas to capture the exact preview at maximum resolution
        const canvas = await html2canvas(certificateRef.current, {
          scale: 3, // High quality scale without exceeding canvas limits
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0, // Ensure all images are loaded
          removeContainer: true, // Clean up after rendering
          foreignObjectRendering: false, // Disable to avoid SVG/HTML interop issues
          onclone: (clonedDoc) => {
            // Fix for SVG background not rendering in html2canvas
            const clonedElement = clonedDoc.querySelector('[data-certificate-preview]') as HTMLElement;
            if (clonedElement) {
              // Ensure the SVG image is properly loaded
              const svgImg = clonedElement.querySelector('img[src*="Abacus_Certificate.svg"]') as HTMLImageElement;
              if (svgImg) {
                // Make sure the image is visible
                svgImg.style.display = 'block';
              }
            }
          }
        });

        // Close loading indicator
        Swal.close();

        if (format === 'jpg') {
          const link = document.createElement('a');
          link.download = `certificate_${studentName.replaceAll(/\s+/g, '_')}_${level}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 1); // Maximum quality for JPG
          link.click();
        } else {
          // PDF format with proper DPI settings for better quality
          const imgData = canvas.toDataURL('image/jpeg', 1); // Maximum quality for PDF embedding
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          
          // Create PDF with higher DPI for better quality
          // Create PDF with ultra-high DPI for superior quality
          const pdf = new jsPDF({
            orientation: imgWidth > imgHeight ? 'l' : 'p',
            unit: 'px',
            format: [imgWidth, imgHeight],
            compress: false, // Disable compression for maximum quality
            precision: 64, // Maximum precision
            floatPrecision: 64, // Maximum floating point precision
            putOnlyUsedFonts: true, // Optimize font usage
            hotfixes: [] // No hotfixes needed
          });
          
          // Set PDF properties for highest quality
          pdf.setProperties({
            title: `Certificate - ${studentName}`,
            subject: 'Student Certificate',
            author: 'Abacus Learning System',
            keywords: 'certificate, abacus, learning',
            creator: 'Abacus Learning System'
          });
          
          // Add image with exact dimensions to avoid any margins
          // Ultra-high DPI for superior quality output
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'NONE'); // Maximum quality
          pdf.save(`certificate_${studentName.replaceAll(/\s+/g, '_')}_${level}.pdf`);
        }
      } catch (err: unknown) {
        console.error(`Error generating ${format.toUpperCase()}:`, err);
        const error = err as Error;
        Swal.fire({
          title: 'Error!',
          text: `Error generating ${format.toUpperCase()}. Please try again.
          
Technical details: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Certificate preview not found. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDownloadJPG = async () => {
    handleDownloadCertificate('jpg');
  };

  const handleDownloadPDF = async () => {
    handleDownloadCertificate('pdf');
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
          
          {/* Country and State Selection */}
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
          
          {/* Search Student */}
         
          
          {/* Student Selection */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Student List {selectedState && `in ${selectedState}`}
              {searchTerm && ` (filtered by: "${searchTerm}")`}
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth disabled={!selectedState || loadingStudents}>
                <InputLabel required>Select Student</InputLabel>
                <Select<number | ''>
                  value={selectedStudent ?? ''}
                  label="Select Student"
                  onChange={handleStudentChange}
                  disabled={!selectedState || loadingStudents}
                >
                  {filteredStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {/* Level Selection */}
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth disabled={!selectedStudent || loadingLevelMarks}>
                <InputLabel required>Select Level</InputLabel>
                <Select<number | ''>
                  value={selectedLevelMark ?? ''}
                  label="Select Level"
                  onChange={handleLevelMarkChange}
                  disabled={!selectedStudent || loadingLevelMarks}
                >
                  {studentLevelMarks.map((levelMark, index) => (
                    <MenuItem key={index} value={index}>
                      {levelMark.level} (Marks: {levelMark.marks})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {/* Certificate Fields */}
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled
              />
              <TextField
                fullWidth
                label="Marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g., 95%"
                disabled
              />
              <TextField
                fullWidth
                label="Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled
              />
            </Stack>
          </Box>
          
          {/* Position Adjustment Controls */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Adjust Level Position</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Level Left Position (%)"
                type="number"
                value={levelLeftPosition}
                onChange={(e) => setLevelLeftPosition(Number(e.target.value))}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                helperText="Adjust the horizontal position of the level text (0-100%)"
                sx={{ width: { xs: '100%', sm: '300px' } }}
              />
            </Stack>
          </Box>
          
          {/* Download Buttons */}
          <Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadJPG}
                disabled={selectedStudent === null || (studentLevelMarks.length > 0 && selectedLevelMark === null)}
              >
                Download as JPG
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDownloadPDF}
                disabled={selectedStudent === null || (studentLevelMarks.length > 0 && selectedLevelMark === null)}
              >
                Download as PDF
              </Button>
            </Stack>
          </Box>
          
          {/* Certificate Preview */}
          <Box sx={{ overflow: 'auto', maxHeight: '600px' }}>
            <div 
              ref={certificateRef}
              data-certificate-preview="true"
              style={{
                width: '595px',
                height: '842px',
                position: 'relative',
                maxWidth: '1200px', // Increased max width for better preview
                margin: '0 auto',
                backgroundColor: '#ffffff',
                imageRendering: 'crisp-edges', // Ensure crisp rendering
                shapeRendering: 'crispEdges',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)', // Force hardware acceleration
                backfaceVisibility: 'hidden', // Reduce flickering
              }}
            >
              {/* SVG Background */}
              <img 
                src="/Abacus_Certificate.svg" 
                alt="Certificate Background" 
                crossOrigin="anonymous"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '56.7%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#8B0000',
                  fontFamily: 'serif',
                  textAlign: 'center',
                  width: '80%',
                  // Enhanced text rendering properties for better quality
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  fontFeatureSettings: '"liga" 1, "kern" 1',
                  fontKerning: 'normal',
                  fontVariantLigatures: 'common-ligatures',
                  letterSpacing: '0.5px'
                }}
              >
                {studentName}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '75.7%',
                  left: '23%',
                  transform: 'translateY(-50%)',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#8B0000',
                  fontFamily: 'serif',
                  textAlign: 'left',
                  width: 'auto',
                  // Enhanced text rendering properties for better quality
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  fontFeatureSettings: '"liga" 1, "kern" 1',
                  fontKerning: 'normal',
                  fontVariantLigatures: 'common-ligatures',
                  letterSpacing: '0.5px'
                }}
              >
                {marks}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '62%',
                  left: `${levelLeftPosition}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#8B0000',
                  fontFamily: 'serif',
                  textAlign: 'center',
                  width: 'auto',
                  // Enhanced text rendering properties for better quality
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  fontFeatureSettings: '"liga" 1, "kern" 1',
                  fontKerning: 'normal',
                  fontVariantLigatures: 'common-ligatures',
                  letterSpacing: '0.5px'
                }}
              >
                {level}
              </div>
              
              <img
                src="/sign.png"
                alt="Director's Signature"
                crossOrigin="anonymous"
                style={{
                  position: 'absolute',
                  top: '82%',
                  right: '43%',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent',
                  imageRendering: 'crisp-edges',
                  // Enhanced image rendering properties for better quality
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  contain: 'layout style paint',
                  // Additional image quality enhancements
                  msHighContrastAdjust: 'none'
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