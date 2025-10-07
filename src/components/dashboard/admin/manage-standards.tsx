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
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';
import { LoadingButton } from '@/components/core/loading-button';

interface Standard {
  id: number;
  name: string;
}

const schema = zod.object({
  name: zod.string().min(1, { message: 'Standard name is required' }),
});

type Values = zod.infer<typeof schema>;

export function ManageStandards(): React.JSX.Element {
  const [standards, setStandards] = React.useState<Standard[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ 
    defaultValues: { name: '' },
    resolver: zodResolver(schema) 
  });

  React.useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    setLoading(true);
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
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch standards. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStandard = async (data: Values) => {
    setIsSubmitting(true);
    try {
      // Convert name to uppercase before sending to backend
      await apiClient.post('/standards', { name: data.name.toUpperCase() });
      
      Swal.fire({
        title: 'Success!',
        text: 'Standard created successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      reset({ name: '' });
      setIsAdding(false);
      fetchStandards(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating standard:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to create standard. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - standards.length) : 0;

  const visibleRows = React.useMemo(
    () => standards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [standards, page, rowsPerPage],
  );

  if (loading) {
    return (
      <Card>
        <CardHeader title="Manage Standards" />
        <Divider />
        <CardContent>
          <Typography>Loading standards...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Manage Standards" />
      <Divider />
      <CardContent>
        {/* Add Standard Form */}
        {isAdding ? (
          <Box component="form" onSubmit={handleSubmit(handleCreateStandard)} sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl error={Boolean(errors.name)} sx={{ flexGrow: 1 }}>
                <InputLabel required>Standard Name</InputLabel>
                <OutlinedInput
                  label="Standard Name"
                  {...control.register('name')}
                />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
              <LoadingButton 
                loading={isSubmitting} 
                type="submit" 
                variant="contained"
                loadingText="Adding..."
              >
                Add Standard
              </LoadingButton>
              <Button variant="outlined" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            onClick={() => setIsAdding(true)}
            sx={{ mb: 3 }}
          >
            Add New Standard
          </Button>
        )}
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Standard Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((standard) => (
                <TableRow hover key={standard.id}>
                  <TableCell>{standard.id}</TableCell>
                  <TableCell>{standard.name}</TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={standards.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardContent>
    </Card>
  );
}