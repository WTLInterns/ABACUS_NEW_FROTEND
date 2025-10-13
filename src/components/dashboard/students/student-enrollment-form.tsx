'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '@/services/api';
import Swal from 'sweetalert2';
import { CustomDatePicker } from '@/components/dashboard/competition/custom-date-picker';
import dayjs, { Dayjs } from 'dayjs';
import eventEmitter from '@/lib/events';
import { LoadingButton } from '@/components/core/loading-button';
import { CircularProgress } from '@mui/material';

// Define types for region entities
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

interface District {
  id: number;
  name: string;
  stateId: number;
  stateName: string;
}

interface Taluka {
  id: number;
  name: string;
  districtId: number;
  districtName: string;
}

// Define types for Standard and Level
interface Standard {
  id: number;
  name: string;
}

interface Level {
  id: number;
  name: string;
}

const schema = zod.object({
  enrollMeantType: zod.string().min(1, { message: 'Enrollment type is required' }),
  firstName: zod.string().min(1, { message: 'First name is required' }),
  middleName: zod.string().optional(),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  gender: zod.string().min(1, { message: 'Gender is required' }),
  whatsappNumber: zod.string().min(10, { message: 'Valid WhatsApp number is required' }),
  dob: zod.string().optional(),
  std: zod.string().min(1, { message: 'Standard is required' }),
  currentLevel: zod.string().min(1, { message: 'Current level is required' }),
  center: zod.string().min(1, { message: 'Center is required' }),
  country: zod.string().min(1, { message: 'Country is required' }),
  state: zod.string().min(1, { message: 'State is required' }),
  district: zod.string().min(1, { message: 'District is required' }),
  taluka: zod.string().min(1, { message: 'Taluka is required' }),
  address: zod.string().min(1, { message: 'Address is required' }),
  city: zod.string().min(1, { message: 'City is required' }),
  email: zod.string().email({ message: 'Valid email is required' })
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  enrollMeantType: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  whatsappNumber: '',
  dob: '',
  std: '',
  currentLevel: '',
  center: '',
  country: '',
  state: '',
  district: '',
  taluka: '',
  address: '',
  city: '',
  email: '',
};

interface StudentFormProps {
  // Remove teacherId prop since we're getting it from localStorage
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function StudentEnrollmentForm(): React.JSX.Element {
  const [dob, setDob] = React.useState<Dayjs | null>(null);
  const [addmissionDate, setAddmissionDate] = React.useState<Dayjs | null>(dayjs()); // Set default to current date
  const [dobError, setDobError] = React.useState<string | undefined>(undefined);
  const [addmissionDateError, setAddmissionDateError] = React.useState<string | undefined>(undefined);
  const [teacherId, setTeacherId] = React.useState<number | null>(null);
  const [teacherName, setTeacherName] = React.useState<string>('');
  
  // Region state management
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [talukas, setTalukas] = React.useState<Taluka[]>([]);
  const [loadingCountries, setLoadingCountries] = React.useState<boolean>(false);
  const [loadingStates, setLoadingStates] = React.useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = React.useState<boolean>(false);
  const [loadingTalukas, setLoadingTalukas] = React.useState<boolean>(false);
  
  // Standard and Level state management
  const [standards, setStandards] = React.useState<Standard[]>([]);
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [loadingStandards, setLoadingStandards] = React.useState<boolean>(false);
  const [loadingLevels, setLoadingLevels] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  // Watch country, state, and district values for dependent dropdowns
  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedDistrict = watch('district');

  // Get teacher ID and name from localStorage on component mount
  React.useEffect(() => {
    const userDataString = localStorage.getItem('user-data');
    if (userDataString) {
      try {
        const userData: UserData = JSON.parse(userDataString);
        setTeacherId(parseInt(userData.id, 10));
        setTeacherName(`${userData.firstName} ${userData.lastName}`);
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

  // Fetch countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch standards and levels on component mount
  React.useEffect(() => {
    fetchStandards();
    fetchLevels();
  }, []);

  // Fetch states when country changes
  React.useEffect(() => {
    if (selectedCountry) {
      fetchStatesByName(selectedCountry);
      // Reset dependent fields
      setStates([]);
      setDistricts([]);
      setTalukas([]);
      // Instead of resetting the entire form, only reset dependent fields
      reset((formValues) => ({
        ...formValues,
        state: '',
        district: '',
        taluka: ''
      }));
    }
  }, [selectedCountry]);

  // Fetch districts when state changes
  React.useEffect(() => {
    if (selectedState) {
      fetchDistrictsByName(selectedState);
      // Reset dependent fields
      setDistricts([]);
      setTalukas([]);
      // Instead of resetting the entire form, only reset dependent fields
      reset((formValues) => ({
        ...formValues,
        district: '',
        taluka: ''
      }));
    }
  }, [selectedState]);

  // Fetch talukas when district changes
  React.useEffect(() => {
    if (selectedDistrict) {
      fetchTalukasByName(selectedDistrict);
      // Reset dependent field
      setTalukas([]);
      // Instead of resetting the entire form, only reset dependent fields
      reset((formValues) => ({
        ...formValues,
        taluka: ''
      }));
    }
  }, [selectedDistrict]);

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
    setStates([]); // Clear previous states
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

  // Fetch districts for a specific state by name
  const fetchDistrictsByName = async (stateName: string) => {
    setLoadingDistricts(true);
    setDistricts([]); // Clear previous districts
    try {
      const response = await apiClient.get<District[]>(`/districts/stateName/${stateName}`);
      setDistricts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch districts. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch talukas for a specific district by name
  const fetchTalukasByName = async (districtName: string) => {
    setLoadingTalukas(true);
    setTalukas([]); // Clear previous talukas
    try {
      const response = await apiClient.get<Taluka[]>(`/talukas/districtName/${districtName}`);
      setTalukas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching talukas:', error);
      setTalukas([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch talukas. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingTalukas(false);
    }
  };

  // Fetch all standards
  const fetchStandards = async () => {
    setLoadingStandards(true);
    try {
      const response = await apiClient.get<Standard[]>('/standards');
      // Convert names to uppercase for display
      const standardsWithUpperCaseNames = response.data.map(standard => ({
        ...standard,
        name: standard.name.toUpperCase()
      }));
      setStandards(standardsWithUpperCaseNames);
    } catch (error) {
      console.error('Error fetching standards:', error);
      setStandards([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch standards. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingStandards(false);
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

  const validateDates = () => {
    let isValid = true;
    
    if (!dob) {
      setDobError('Date of birth is required');
      isValid = false;
    } else {
      setDobError(undefined);
    }
    
    // Admission date is now optional since it defaults to current date
    setAddmissionDateError(undefined);
    
    return isValid;
  };

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      // Validate dates manually
      if (!validateDates()) {
        return;
      }
      
      // Check if teacherId is available
      if (!teacherId) {
        Swal.fire({
          title: 'Error!',
          text: 'Teacher information not found. Please log in again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      try {
        // Prepare data for submission (region names are already in the data)
        const submissionData = {
          ...data,
          dob: dob ? dob.format('YYYY-MM-DD') : '',
          addmissionDate: addmissionDate ? addmissionDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'), // Use current date if not set
        };
        
        // Make API call to create student
        const response = await apiClient.post(`/students/createStudent/${teacherId}`, submissionData);
        
        Swal.fire({
          title: 'Success!',
          text: 'Student enrolled successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Emit event to notify other components
        eventEmitter.emit('studentCreated', response.data);
        
        // Reset form
        reset(defaultValues);
        setDob(null);
        setAddmissionDate(dayjs()); // Reset to current date
        setDobError(undefined);
        setAddmissionDateError(undefined);
        setStates([]);
        setDistricts([]);
        setTalukas([]);
      } catch (error: any) {
        console.error('Error enrolling student:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to enroll student. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [reset, teacherId, teacherName, dob, addmissionDate]
  );

  return (
    <Card>
      <CardHeader 
        title="Student Enrollment Form" 
        subheader={teacherName ? `Teacher: ${teacherName}` : 'Teacher information loading...'}
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Enrollment Type Selection */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Select Enrollment Type</Typography>
              <Controller
                control={control}
                name="enrollMeantType"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.enrollMeantType)} fullWidth>
                    <InputLabel required>Enrollment Type</InputLabel>
                    <Select
                      {...field}
                      label="Enrollment Type"
                      value={field.value || ''}
                    >
                      <MenuItem value="ABACUS">ABACUS</MenuItem>
                      <MenuItem value="VEDIC-MATH">VEDIC MATH</MenuItem>
                    </Select>
                    {errors.enrollMeantType ? <FormHelperText>{errors.enrollMeantType.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Personal Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Personal Information</Typography>
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.firstName)} fullWidth>
                    <InputLabel required>First Name</InputLabel>
                    <OutlinedInput {...field} label="First Name" />
                    {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="middleName"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Middle Name</InputLabel>
                    <OutlinedInput {...field} label="Middle Name" />
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.lastName)} fullWidth>
                    <InputLabel required>Last Name</InputLabel>
                    <OutlinedInput {...field} label="Last Name" />
                    {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.gender)} fullWidth>
                    <InputLabel required>Gender</InputLabel>
                    <Select
                      {...field}
                      label="Gender"
                      value={field.value || ''}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                    {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.whatsappNumber)} fullWidth>
                    <InputLabel required>WhatsApp Number</InputLabel>
                    <OutlinedInput {...field} label="WhatsApp Number" type="tel" />
                    {errors.whatsappNumber ? <FormHelperText>{errors.whatsappNumber.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <CustomDatePicker
                label="Date of Birth"
                value={dob}
                onChange={(newValue) => {
                  setDob(newValue);
                  if (newValue) {
                    setDobError(undefined);
                  }
                }}
                error={Boolean(dobError)}
                helperText={dobError || undefined}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <CustomDatePicker
                label="Admission Date"
                value={addmissionDate}
                onChange={(newValue) => {
                  setAddmissionDate(newValue);
                  if (newValue) {
                    setAddmissionDateError(undefined);
                  }
                }}
                error={Boolean(addmissionDateError)}
                helperText={addmissionDateError || undefined}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.email)} fullWidth>
                    <InputLabel required>Email</InputLabel>
                    <OutlinedInput {...field} label="Email" type="email" />
                    {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Academic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Academic Information</Typography>
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="std"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.std)} fullWidth>
                    <InputLabel required>Standard</InputLabel>
                    <Select
                      {...field}
                      label="Standard"
                      value={field.value || ''}
                    >
                      {standards.map((standard) => (
                        <MenuItem key={standard.id} value={standard.name}>
                          {standard.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingStandards && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.std ? <FormHelperText>{errors.std.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="currentLevel"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.currentLevel)} fullWidth>
                    <InputLabel required>Current Level</InputLabel>
                    <Select
                      {...field}
                      label="Current Level"
                      value={field.value || ''}
                    >
                      {levels.map((level) => (
                        <MenuItem key={level.id} value={level.name}>
                          {level.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingLevels && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.currentLevel ? <FormHelperText>{errors.currentLevel.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Address Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Address Information</Typography>
            </Grid>
            
            {/* Country Dropdown */}
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.country)} fullWidth>
                    <InputLabel required>Country</InputLabel>
                    <Select
                      {...field}
                      label="Country"
                      value={field.value || ''}
                    >
                      {Array.isArray(countries) && countries.map((country) => (
                        <MenuItem key={country.id} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingCountries && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.country ? <FormHelperText>{errors.country.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* State Dropdown */}
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.state)} fullWidth disabled={!selectedCountry}>
                    <InputLabel required>State</InputLabel>
                    <Select
                      {...field}
                      label="State"
                      value={field.value || ''}
                      disabled={!selectedCountry}
                    >
                      {Array.isArray(states) && states.map((state) => (
                        <MenuItem key={state.id} value={state.name}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingStates && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.state ? <FormHelperText>{errors.state.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* District Dropdown */}
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.district)} fullWidth disabled={!selectedState}>
                    <InputLabel required>District</InputLabel>
                    <Select
                      {...field}
                      label="District"
                      value={field.value || ''}
                      disabled={!selectedState}
                    >
                      {Array.isArray(districts) && districts.map((district) => (
                        <MenuItem key={district.id} value={district.name}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingDistricts && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.district ? <FormHelperText>{errors.district.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Taluka Dropdown */}
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="taluka"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.taluka)} fullWidth disabled={!selectedDistrict}>
                    <InputLabel required>Taluka</InputLabel>
                    <Select
                      {...field}
                      label="Taluka"
                      value={field.value || ''}
                      disabled={!selectedDistrict}
                    >
                      {Array.isArray(talukas) && talukas.map((taluka) => (
                        <MenuItem key={taluka.id} value={taluka.name}>
                          {taluka.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingTalukas && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 30, top: 15 }} />
                    )}
                    {errors.taluka ? <FormHelperText>{errors.taluka.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="center"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.center)} fullWidth>
                    <InputLabel required>Center</InputLabel>
                    <OutlinedInput {...field} label="Center" />
                    {errors.center ? <FormHelperText>{errors.center.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ md: 4, xs: 12 }}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.city)} fullWidth>
                    <InputLabel required>City</InputLabel>
                    <OutlinedInput {...field} label="City" />
                    {errors.city ? <FormHelperText>{errors.city.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.address)} fullWidth>
                    <InputLabel required>Address</InputLabel>
                    <OutlinedInput {...field} label="Address" multiline rows={3} />
                    {errors.address ? <FormHelperText>{errors.address.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <LoadingButton
                  loading={isSubmitting}
                  disabled={!teacherId}
                  type="submit"
                  variant="contained"
                  loadingText="Enrolling..."
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  Enroll Student
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}