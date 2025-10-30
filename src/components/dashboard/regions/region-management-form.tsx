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
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '@/services/api';
import Swal from 'sweetalert2';
import { LoadingButton } from '@/components/core/loading-button';

// Define types for our region entities (updated to match DTOs)
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

// Define form schemas
const countrySchema = zod.object({
  name: zod.string().min(1, { message: 'Country name is required' }),
});

const stateSchema = zod.object({
  name: zod.string().min(1, { message: 'State name is required' }),
  countryId: zod.number({ required_error: 'Country is required' }),
});

const districtSchema = zod.object({
  name: zod.string().min(1, { message: 'District name is required' }),
  stateId: zod.number({ required_error: 'State is required' }),
});

const talukaSchema = zod.object({
  name: zod.string().min(1, { message: 'Taluka name is required' }),
  districtId: zod.number({ required_error: 'District is required' }),
});

type CountryValues = zod.infer<typeof countrySchema>;
type StateValues = zod.infer<typeof stateSchema>;
type DistrictValues = zod.infer<typeof districtSchema>;
type TalukaValues = zod.infer<typeof talukaSchema>;

const defaultCountryValues: CountryValues = {
  name: '',
};

const defaultStateValues: StateValues = {
  name: '',
  countryId: 0,
};

const defaultDistrictValues: DistrictValues = {
  name: '',
  stateId: 0,
};

const defaultTalukaValues: TalukaValues = {
  name: '',
  districtId: 0,
};

export function RegionManagementForm(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<'country' | 'state' | 'district' | 'taluka'>('country');
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [talukas, setTalukas] = React.useState<Taluka[]>([]);
  const [_loading, _setLoading] = React.useState<boolean>(false);
  const [countriesLoading, setCountriesLoading] = React.useState<boolean>(false);
  const [statesLoading, setStatesLoading] = React.useState<boolean>(false);
  const [districtsLoading, setDistrictsLoading] = React.useState<boolean>(false);
  const [talukasLoading, setTalukasLoading] = React.useState<boolean>(false);
  
  // Editing states
  const [editingCountry, setEditingCountry] = React.useState<Country | null>(null);
  const [editingState, setEditingState] = React.useState<State | null>(null);
  const [editingDistrict, setEditingDistrict] = React.useState<District | null>(null);
  const [editingTaluka, setEditingTaluka] = React.useState<Taluka | null>(null);

  // Form hooks for each entity type
  const {
    control: countryControl,
    handleSubmit: handleCountrySubmit,
    reset: resetCountry,
    formState: { errors: countryErrors, isSubmitting: isCountrySubmitting },
  } = useForm<CountryValues>({ 
    defaultValues: defaultCountryValues, 
    resolver: zodResolver(countrySchema) 
  });

  const {
    control: stateControl,
    handleSubmit: handleStateSubmit,
    reset: resetState,
    formState: { errors: stateErrors, isSubmitting: isStateSubmitting },
  } = useForm<StateValues>({ 
    defaultValues: defaultStateValues, 
    resolver: zodResolver(stateSchema) 
  });

  const {
    control: districtControl,
    handleSubmit: handleDistrictSubmit,
    reset: resetDistrict,
    formState: { errors: districtErrors, isSubmitting: isDistrictSubmitting },
  } = useForm<DistrictValues>({ 
    defaultValues: defaultDistrictValues, 
    resolver: zodResolver(districtSchema) 
  });

  const {
    control: talukaControl,
    handleSubmit: handleTalukaSubmit,
    reset: resetTaluka,
    formState: { errors: talukaErrors, isSubmitting: isTalukaSubmitting },
  } = useForm<TalukaValues>({ 
    defaultValues: defaultTalukaValues, 
    resolver: zodResolver(talukaSchema) 
  });

  // Fetch all countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const response = await apiClient.get<Country[]>('/countries');
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch countries. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchStates = async (countryId: number) => {
    setStatesLoading(true);
    try {
      const response = await apiClient.get<State[]>(`/states/country/${countryId}`);
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch states. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchDistricts = async (stateId: number) => {
    setDistrictsLoading(true);
    try {
      const response = await apiClient.get<District[]>(`/districts/state/${stateId}`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch districts. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDistrictsLoading(false);
    }
  };

  const fetchTalukas = async (districtId: number) => {
    setTalukasLoading(true);
    try {
      const response = await apiClient.get<Taluka[]>(`/talukas/district/${districtId}`);
      setTalukas(response.data);
    } catch (error) {
      console.error('Error fetching talukas:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch talukas. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setTalukasLoading(false);
    }
  };

  const handleCountrySubmitForm = React.useCallback(
    async (data: CountryValues): Promise<void> => {
      try {
        if (editingCountry) {
          // Update existing country
          const response = await apiClient.put<Country>(`/countries/${editingCountry.id}`, data);
          setCountries(countries.map(country => country.id === editingCountry.id ? response.data : country));
          
          Swal.fire({
            title: 'Success!',
            text: 'Country updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          // Add new country
          const response = await apiClient.post<Country>('/countries/add', data);
          setCountries([...countries, response.data]);
          
          Swal.fire({
            title: 'Success!',
            text: 'Country added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
        
        resetCountry(defaultCountryValues);
        setEditingCountry(null);
      } catch (error: unknown) {
        console.error('Error saving country:', error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || `Failed to ${editingCountry ? 'update' : 'add'} country. Please try again.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [countries, resetCountry, editingCountry]
  );

  const handleStateSubmitForm = React.useCallback(
    async (data: StateValues): Promise<void> => {
      try {
        if (editingState) {
          // Update existing state
          const response = await apiClient.put<State>(`/states/${editingState.id}/${data.countryId}`, {
            id: editingState.id,
            name: data.name,
            countryId: data.countryId
          });
          setStates(states.map(state => state.id === editingState.id ? response.data : state));
          
          Swal.fire({
            title: 'Success!',
            text: 'State updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          // Add new state
          const response = await apiClient.post<State>(`/states/add/${data.countryId}`, data);
          setStates([...states, response.data]);
          
          Swal.fire({
            title: 'Success!',
            text: 'State added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
        
        resetState(defaultStateValues);
        setEditingState(null);
      } catch (error: unknown) {
        console.error('Error saving state:', error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || `Failed to ${editingState ? 'update' : 'add'} state. Please try again.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [states, resetState, editingState]
  );

  const handleDistrictSubmitForm = React.useCallback(
    async (data: DistrictValues): Promise<void> => {
      try {
        if (editingDistrict) {
          // Update existing district
          const response = await apiClient.put<District>(`/districts/${editingDistrict.id}`, {
            id: editingDistrict.id,
            name: data.name,
            stateId: data.stateId
          });
          setDistricts(districts.map(district => district.id === editingDistrict.id ? response.data : district));
          
          Swal.fire({
            title: 'Success!',
            text: 'District updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          // Add new district
          const response = await apiClient.post<District>(`/districts/add/${data.stateId}`, data);
          setDistricts([...districts, response.data]);
          
          Swal.fire({
            title: 'Success!',
            text: 'District added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
        
        resetDistrict(defaultDistrictValues);
        setEditingDistrict(null);
      } catch (error: unknown) {
        console.error('Error saving district:', error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || `Failed to ${editingDistrict ? 'update' : 'add'} district. Please try again.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [districts, resetDistrict, editingDistrict]
  );

  const handleTalukaSubmitForm = React.useCallback(
    async (data: TalukaValues): Promise<void> => {
      try {
        if (editingTaluka) {
          // Update existing taluka
          const response = await apiClient.put<Taluka>(`/talukas/${editingTaluka.id}`, {
            id: editingTaluka.id,
            name: data.name,
            districtId: data.districtId
          });
          setTalukas(talukas.map(taluka => taluka.id === editingTaluka.id ? response.data : taluka));
          
          Swal.fire({
            title: 'Success!',
            text: 'Taluka updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          // Add new taluka
          const response = await apiClient.post<Taluka>(`/talukas/add/${data.districtId}`, data);
          setTalukas([...talukas, response.data]);
          
          Swal.fire({
            title: 'Success!',
            text: 'Taluka added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
        
        resetTaluka(defaultTalukaValues);
        setEditingTaluka(null);
      } catch (error: unknown) {
        console.error('Error saving taluka:', error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || `Failed to ${editingTaluka ? 'update' : 'add'} taluka. Please try again.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    [talukas, resetTaluka, editingTaluka]
  );

  // Handle country selection for states
  const handleCountryChange = (countryId: number) => {
    fetchStates(countryId);
  };

  // Handle state selection for districts
  const handleStateChange = (stateId: number) => {
    fetchDistricts(stateId);
  };

  // Handle district selection for talukas
  const handleDistrictChange = (districtId: number) => {
    fetchTalukas(districtId);
  };

  // Handle country edit
  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    resetCountry({ name: country.name });
  };

  // Handle country delete
  const handleDeleteCountry = async (countryId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this country? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/countries/${countryId}`);
        
        // Remove the country from the local state
        setCountries(countries.filter(country => country.id !== countryId));
        
        Swal.fire({
          title: 'Success!',
          text: 'Country deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting country:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete country. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Handle state edit
  const handleEditState = (state: State) => {
    setEditingState(state);
    resetState({ name: state.name, countryId: state.countryId });
  };

  // Handle state delete
  const handleDeleteState = async (stateId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this state? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/states/${stateId}`);
        
        // Remove the state from the local state
        setStates(states.filter(state => state.id !== stateId));
        
        Swal.fire({
          title: 'Success!',
          text: 'State deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting state:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete state. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Handle district edit
  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    resetDistrict({ name: district.name, stateId: district.stateId });
  };

  // Handle district delete
  const handleDeleteDistrict = async (districtId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this district? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/districts/${districtId}`);
        
        // Remove the district from the local state
        setDistricts(districts.filter(district => district.id !== districtId));
        
        Swal.fire({
          title: 'Success!',
          text: 'District deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting district:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete district. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Handle taluka edit
  const handleEditTaluka = (taluka: Taluka) => {
    setEditingTaluka(taluka);
    resetTaluka({ name: taluka.name, districtId: taluka.districtId });
  };

  // Handle taluka delete
  const handleDeleteTaluka = async (talukaId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this taluka? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/talukas/${talukaId}`);
        
        // Remove the taluka from the local state
        setTalukas(talukas.filter(taluka => taluka.id !== talukaId));
        
        Swal.fire({
          title: 'Success!',
          text: 'Taluka deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting taluka:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete taluka. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Region Management" />
      <Divider />
      <CardContent>
        {/* Tab Navigation */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant={activeTab === 'country' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('country')}
            >
              Countries
            </Button>
            <Button
              variant={activeTab === 'state' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('state')}
            >
              States
            </Button>
            <Button
              variant={activeTab === 'district' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('district')}
            >
              Districts
            </Button>
            <Button
              variant={activeTab === 'taluka' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('taluka')}
            >
              Talukas
            </Button>
          </Stack>
        </Box>

        {/* Country Form */}
        {activeTab === 'country' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Country</Typography>
            <form onSubmit={handleCountrySubmit(handleCountrySubmitForm)}>
              <Grid container spacing={3}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={countryControl}
                    name="name"
                    render={({ field }) => (
                      <FormControl error={Boolean(countryErrors.name)} fullWidth>
                        <InputLabel required>Country Name</InputLabel>
                        <OutlinedInput {...field} label="Country Name" />
                        {countryErrors.name ? <FormHelperText>{countryErrors.name.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LoadingButton 
                    loading={isCountrySubmitting} 
                    type="submit" 
                    variant="contained"
                    loadingText={editingCountry ? 'Updating...' : 'Adding...'}
                  >
                    {editingCountry ? 'Update Country' : 'Add Country'}
                  </LoadingButton>
                  {editingCountry && (
                    <Button 
                      onClick={() => {
                        resetCountry(defaultCountryValues);
                        setEditingCountry(null);
                      }}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Grid>
              </Grid>
            </form>

            {/* Countries Table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Countries List</Typography>
              {countriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {countries && Array.isArray(countries) && countries.length > 0 ? (
                      countries.map((country) => (
                        <TableRow key={country.id}>
                          <TableCell>{country.id}</TableCell>
                          <TableCell>{country.name}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleEditCountry(country)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="outlined"
                                onClick={() => handleDeleteCountry(country.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No countries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        )}

        {/* State Form */}
        {activeTab === 'state' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New State</Typography>
            <form onSubmit={handleStateSubmit(handleStateSubmitForm)}>
              <Grid container spacing={3}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={stateControl}
                    name="countryId"
                    render={({ field }) => (
                      <FormControl error={Boolean(stateErrors.countryId)} fullWidth>
                        <InputLabel required>Country</InputLabel>
                        <Select
                          {...field}
                          label="Country"
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCountryChange(Number(e.target.value));
                          }}
                        >
                          {countries && Array.isArray(countries) && countries.length > 0 && (
                            countries.map((country) => (
                              <MenuItem key={country.id} value={country.id}>
                                {country.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {stateErrors.countryId ? <FormHelperText>{stateErrors.countryId.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={stateControl}
                    name="name"
                    render={({ field }) => (
                      <FormControl error={Boolean(stateErrors.name)} fullWidth>
                        <InputLabel required>State Name</InputLabel>
                        <OutlinedInput {...field} label="State Name" />
                        {stateErrors.name ? <FormHelperText>{stateErrors.name.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LoadingButton 
                    loading={isStateSubmitting} 
                    type="submit" 
                    variant="contained"
                    loadingText={editingState ? 'Updating...' : 'Adding...'}
                  >
                    {editingState ? 'Update State' : 'Add State'}
                  </LoadingButton>
                  {editingState && (
                    <Button 
                      onClick={() => {
                        resetState(defaultStateValues);
                        setEditingState(null);
                      }}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    >
                      Cancel
                    </Button>
                  )}

                </Grid>
              </Grid>
            </form>

            {/* States Table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>States List</Typography>
              {statesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {states && Array.isArray(states) && states.length > 0 ? (
                      states.map((state) => (
                        <TableRow key={state.id}>
                          <TableCell>{state.id}</TableCell>
                          <TableCell>{state.name}</TableCell>
                          <TableCell>
                            {countries && Array.isArray(countries) && countries.find(c => c.id === state.countryId)?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleEditState(state)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="outlined"
                                onClick={() => handleDeleteState(state.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No states found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        )}

        {/* District Form */}
        {activeTab === 'district' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New District</Typography>
            <form onSubmit={handleDistrictSubmit(handleDistrictSubmitForm)}>
              <Grid container spacing={3}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={districtControl}
                    name="stateId"
                    render={({ field }) => (
                      <FormControl error={Boolean(districtErrors.stateId)} fullWidth>
                        <InputLabel required>State</InputLabel>
                        <Select
                          {...field}
                          label="State"
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e);
                            handleStateChange(Number(e.target.value));
                          }}
                        >
                          {states && Array.isArray(states) && states.length > 0 && (
                            states.map((state) => (
                              <MenuItem key={state.id} value={state.id}>
                                {state.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {districtErrors.stateId ? <FormHelperText>{districtErrors.stateId.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={districtControl}
                    name="name"
                    render={({ field }) => (
                      <FormControl error={Boolean(districtErrors.name)} fullWidth>
                        <InputLabel required>District Name</InputLabel>
                        <OutlinedInput {...field} label="District Name" />
                        {districtErrors.name ? <FormHelperText>{districtErrors.name.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LoadingButton 
                    loading={isDistrictSubmitting} 
                    type="submit" 
                    variant="contained"
                    loadingText={editingDistrict ? 'Updating...' : 'Adding...'}
                  >
                    {editingDistrict ? 'Update District' : 'Add District'}
                  </LoadingButton>
                  {editingDistrict && (
                    <Button 
                      onClick={() => {
                        resetDistrict(defaultDistrictValues);
                        setEditingDistrict(null);
                      }}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Grid>
              </Grid>
            </form>

            {/* Districts Table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Districts List</Typography>
              {districtsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {districts && Array.isArray(districts) && districts.length > 0 ? (
                      districts.map((district) => (
                        <TableRow key={district.id}>
                          <TableCell>{district.id}</TableCell>
                          <TableCell>{district.name}</TableCell>
                          <TableCell>
                            {states && Array.isArray(states) && states.find(s => s.id === district.stateId)?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleEditDistrict(district)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="outlined"
                                onClick={() => handleDeleteDistrict(district.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No districts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        )}

        {/* Taluka Form */}
        {activeTab === 'taluka' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Taluka</Typography>
            <form onSubmit={handleTalukaSubmit(handleTalukaSubmitForm)}>
              <Grid container spacing={3}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={talukaControl}
                    name="districtId"
                    render={({ field }) => (
                      <FormControl error={Boolean(talukaErrors.districtId)} fullWidth>
                        <InputLabel required>District</InputLabel>
                        <Select
                          {...field}
                          label="District"
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e);
                            handleDistrictChange(Number(e.target.value));
                          }}
                        >
                          {districts && Array.isArray(districts) && districts.length > 0 && (
                            districts.map((district) => (
                              <MenuItem key={district.id} value={district.id}>
                                {district.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {talukaErrors.districtId ? <FormHelperText>{talukaErrors.districtId.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <Controller
                    control={talukaControl}
                    name="name"
                    render={({ field }) => (
                      <FormControl error={Boolean(talukaErrors.name)} fullWidth>
                        <InputLabel required>Taluka Name</InputLabel>
                        <OutlinedInput {...field} label="Taluka Name" />
                        {talukaErrors.name ? <FormHelperText>{talukaErrors.name.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LoadingButton 
                    loading={isTalukaSubmitting} 
                    type="submit" 
                    variant="contained"
                    loadingText={editingTaluka ? 'Updating...' : 'Adding...'}
                  >
                    {editingTaluka ? 'Update Taluka' : 'Add Taluka'}
                  </LoadingButton>
                  {editingTaluka && (
                    <Button 
                      onClick={() => {
                        resetTaluka(defaultTalukaValues);
                        setEditingTaluka(null);
                      }}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Grid>
              </Grid>
            </form>

            {/* Talukas Table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Talukas List</Typography>
              {talukasLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>District</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {talukas && Array.isArray(talukas) && talukas.length > 0 ? (
                      talukas.map((taluka) => (
                        <TableRow key={taluka.id}>
                          <TableCell>{taluka.id}</TableCell>
                          <TableCell>{taluka.name}</TableCell>
                          <TableCell>
                            {districts && Array.isArray(districts) && districts.find(d => d.id === taluka.districtId)?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleEditTaluka(taluka)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="outlined"
                                onClick={() => handleDeleteTaluka(taluka.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No talukas found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}