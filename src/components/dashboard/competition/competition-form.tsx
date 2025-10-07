'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
import { PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { LoadingButton } from '@/components/core/loading-button';
import { RegionManagementSection } from '@/components/dashboard/competition/region-management-section';

const schema = zod.object({
  competitionName: zod.string().min(1, { message: 'Competition name is required' }),
  heading: zod.string().min(1, { message: 'Heading is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  registrationLastDate: zod.string().optional(), // Make optional since we're handling it separately
  startDate: zod.string().optional(), // Make optional since we're handling it separately
  endDate: zod.string().optional(), // Make optional since we're handling it separately
  status: zod.string().min(1, { message: 'Status is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  competitionName: '',
  heading: '',
  description: '',
  registrationLastDate: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE', // Default to ACTIVE
};

interface CompetitionItem {
  id: number;
  competitionName: string;
  heading: string;
  description: string;
  registrationLastDate: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function CompetitionForm(): React.JSX.Element {
  const [showForm, setShowForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CompetitionItem | null>(null);
  const [competitionItems, setCompetitionItems] = React.useState<CompetitionItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  
  // Date states for the custom date pickers
  const [registrationLastDate, setRegistrationLastDate] = React.useState<Dayjs | null>(null);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  
  // Error states for date fields
  const [registrationLastDateError, setRegistrationLastDateError] = React.useState<string | undefined>(undefined);
  const [startDateError, setStartDateError] = React.useState<string | undefined>(undefined);
  const [endDateError, setEndDateError] = React.useState<string | undefined>(undefined);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  // Fetch all competition items when component mounts
  React.useEffect(() => {
    fetchCompetitionItems();
  }, []);

  const fetchCompetitionItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<CompetitionItem[]>('/competition/getAllCompetition');
      setCompetitionItems(response.data);
    } catch (error) {
      console.error('Error fetching competition items:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch competition items. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (item: CompetitionItem) => {
    setEditingItem(item);
    setValue('competitionName', item.competitionName);
    setValue('heading', item.heading);
    setValue('description', item.description);
    setValue('status', item.status);
    
    // Set date values for the custom date pickers
    if (item.registrationLastDate) {
      setRegistrationLastDate(dayjs(item.registrationLastDate));
      setRegistrationLastDateError(undefined);
    }
    if (item.startDate) {
      setStartDate(dayjs(item.startDate));
      setStartDateError(undefined);
    }
    if (item.endDate) {
      setEndDate(dayjs(item.endDate));
      setEndDateError(undefined);
    }
    
    setShowForm(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this competition? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/competition/deleteCompetition/${id}`);
        
        // Remove the item from the local state
        setCompetitionItems(prevItems => prevItems.filter(item => item.id !== id));
        
        Swal.fire({
          title: 'Success!',
          text: 'Competition deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting competition:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete competition. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const validateDates = () => {
    let isValid = true;
    
    if (!registrationLastDate) {
      setRegistrationLastDateError('Registration last date is required');
      isValid = false;
    } else {
      setRegistrationLastDateError(undefined);
    }
    
    if (!startDate) {
      setStartDateError('Start date is required');
      isValid = false;
    } else {
      setStartDateError(undefined);
    }
    
    if (!endDate) {
      setEndDateError('End date is required');
      isValid = false;
    } else {
      setEndDateError(undefined);
    }
    
    return isValid;
  };

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      // Validate dates manually since they're not part of the react-hook-form state
      if (!validateDates()) {
        return;
      }
      
      try {
        // Add date values to the data
        const submissionData = {
          ...data,
          registrationLastDate: registrationLastDate ? registrationLastDate.format('YYYY-MM-DD') : '',
          startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
          endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
        };
        
        if (editingItem) {
          // Update existing item
          const response = await apiClient.put<CompetitionItem>(`/competition/updateCompetition/${editingItem.id}`, submissionData);
          
          // Update the item in the local state
          setCompetitionItems(prevItems => 
            prevItems.map(competitionItem => 
              competitionItem.id === editingItem.id ? { ...response.data } : competitionItem
            )
          );
          
          Swal.fire({
            title: 'Success!',
            text: 'Competition updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          // Add new item
          const response = await apiClient.post<CompetitionItem>('/competition/addCompetition', submissionData);
          
          // Add to competition items list
          setCompetitionItems(prevItems => [...prevItems, response.data]);
          
          Swal.fire({
            title: 'Success!',
            text: 'Competition added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
        
        // Reset form and hide it
        reset(defaultValues);
        setEditingItem(null);
        setRegistrationLastDate(null);
        setStartDate(null);
        setEndDate(null);
        setRegistrationLastDateError(undefined);
        setStartDateError(undefined);
        setEndDateError(undefined);
        setShowForm(false);
      } catch (error) {
        console.error('Error saving competition:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save competition. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [reset, editingItem, registrationLastDate, startDate, endDate]
  );

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      reset(defaultValues);
      setEditingItem(null);
      setRegistrationLastDate(null);
      setStartDate(null);
      setEndDate(null);
      setRegistrationLastDateError(undefined);
      setStartDateError(undefined);
      setEndDateError(undefined);
    }
  };

  return (
    <Box>
      <Card>
        <CardHeader title="Manage Competitions" />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                placeholder="Search competitions..."
                sx={{ flex: 1 }}
              />
              <Button 
                variant="contained" 
                color={showForm ? 'success' : 'primary'}
                onClick={handleToggleForm}
              >
                {showForm ? '+ Cancel' : 'Add Competition'}
              </Button>
            </Stack>
          </Box>
          
          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card sx={{ mb: 3, bgcolor: 'neutral.50' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={{ md: 6, xs: 12 }}>
                      <Controller
                        control={control}
                        name="competitionName"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.competitionName)} fullWidth>
                            <InputLabel required>Competition Name</InputLabel>
                            <OutlinedInput {...field} label="Competition Name" />
                            {errors.competitionName ? <FormHelperText>{errors.competitionName.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ md: 6, xs: 12 }}>
                      <Controller
                        control={control}
                        name="heading"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.heading)} fullWidth>
                            <InputLabel required>Heading</InputLabel>
                            <OutlinedInput {...field} label="Heading" />
                            {errors.heading ? <FormHelperText>{errors.heading.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ md: 12, xs: 12 }}>
                      <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.description)} fullWidth>
                            <InputLabel required>Description</InputLabel>
                            <OutlinedInput {...field} label="Description" multiline rows={4} />
                            {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ md: 4, xs: 12 }}>
                      <CustomDatePicker
                        label="Registration Last Date"
                        value={registrationLastDate}
                        onChange={(newValue) => {
                          setRegistrationLastDate(newValue);
                          if (newValue) {
                            setRegistrationLastDateError(undefined);
                          }
                        }}
                        error={Boolean(registrationLastDateError)}
                        helperText={registrationLastDateError || undefined}
                      />
                    </Grid>
                    <Grid size={{ md: 4, xs: 12 }}>
                      <CustomDatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => {
                          setStartDate(newValue);
                          if (newValue) {
                            setStartDateError(undefined);
                          }
                        }}
                        error={Boolean(startDateError)}
                        helperText={startDateError || undefined}
                      />
                    </Grid>
                    <Grid size={{ md: 4, xs: 12 }}>
                      <CustomDatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => {
                          setEndDate(newValue);
                          if (newValue) {
                            setEndDateError(undefined);
                          }
                        }}
                        error={Boolean(endDateError)}
                        helperText={endDateError || undefined}
                      />
                    </Grid>
                    <Grid size={{ md: 12, xs: 12 }}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.status)} fullWidth>
                            <InputLabel required>Status</InputLabel>
                            <Select
                              {...field}
                              label="Status"
                              value={field.value || 'ACTIVE'}
                            >
                              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                            </Select>
                            {errors.status ? <FormHelperText>{errors.status.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <LoadingButton 
                      loading={isSubmitting} 
                      type="submit" 
                      variant="contained"
                      loadingText={editingItem ? 'Updating...' : 'Adding...'}
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
                      {editingItem ? 'Update Competition' : 'Add Competition'}
                    </LoadingButton>
                  </Box>
                </CardContent>
              </Card>
            </form>
          )}
          
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Competition Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Heading</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Registration Last Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1">Loading competitions...</Typography>
                    </TableCell>
                  </TableRow>
                ) : competitionItems.length > 0 ? (
                  competitionItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:not(:last-child)': { borderBottom: '1px solid #e0e0e0' }
                      }}
                    >
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.competitionName}</TableCell>
                      <TableCell>{item.heading}</TableCell>
                      <TableCell>{item.description.substring(0, 50)}{item.description.length > 50 ? '...' : ''}</TableCell>
                      <TableCell>{item.registrationLastDate}</TableCell>
                      <TableCell>{item.startDate}</TableCell>
                      <TableCell>{item.endDate}</TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            backgroundColor: item.status === 'ACTIVE' ? '#e8f5e9' : '#ffebee', 
                            color: item.status === 'ACTIVE' ? '#2e7d32' : '#c62828',
                            borderRadius: '16px',
                            padding: '4px 12px',
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            startIcon={<PencilIcon />} 
                            onClick={() => handleEditClick(item)}
                            variant="outlined"
                            sx={{ 
                              borderRadius: '16px',
                              textTransform: 'none',
                              borderColor: '#1976d2',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#1976d20a',
                                borderColor: '#1565c0',
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<TrashIcon />} 
                            color="error"
                            onClick={() => handleDeleteClick(item.id)}
                            variant="outlined"
                            sx={{ 
                              borderRadius: '16px',
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: '#d32f2f0a',
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1">No competitions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
      
      {/* Region Management Section */}
      <RegionManagementSection />
    </Box>
  );
}