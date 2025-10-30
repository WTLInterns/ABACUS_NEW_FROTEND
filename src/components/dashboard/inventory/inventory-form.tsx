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
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr';
import { useInventory } from '@/hooks';
import Swal from 'sweetalert2';
import { LoadingButton } from '@/components/core/loading-button';

const schema = zod.object({
  itemName: zod.string().min(1, { message: 'Item name is required' }),
  quantity: zod.number().min(1, { message: 'Quantity must be at least 1' }),
  pricePerItem: zod.number().min(0, { message: 'Price must be a positive number' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  itemName: '',
  quantity: 1,
  pricePerItem: 0,
};

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  pricePerItem: number;
}

export function InventoryForm(): React.JSX.Element {
  const [showForm, setShowForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const { inventoryItems, loading, fetchInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  // Fetch all inventory items when component mounts
  React.useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Handle edit button click
  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setValue('itemName', item.itemName);
    setValue('quantity', item.quantity);
    setValue('pricePerItem', item.pricePerItem);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this inventory item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteInventoryItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      try {
        // Update existing item or add new item
        const operation = editingItem
          ? updateInventoryItem(editingItem.id, {
              itemName: data.itemName,
              quantity: data.quantity,
              pricePerItem: data.pricePerItem,
            })
          : addInventoryItem({
              itemName: data.itemName,
              quantity: data.quantity,
              pricePerItem: data.pricePerItem,
            });
        
        await operation;
        
        // Reset form and hide it
        reset(defaultValues);
        setEditingItem(null);
        setShowForm(false);
      } catch (error) {
        // Error is already handled in the hook
        console.error('Error in form submission:', error);
      }
    },
    [addInventoryItem, updateInventoryItem, reset, editingItem]
  );

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      reset(defaultValues);
      setEditingItem(null);
    }
  };

  return (
    <Card>
      <CardHeader title="Manage Inventory" />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search inventory items..."
              sx={{ flex: 1 }}
            />
            <Button 
              variant="contained" 
              color={showForm ? 'success' : 'primary'}
              onClick={handleToggleForm}
            >
              {showForm ? '+ Cancel' : 'Add Inventory Item'}
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
                      name="itemName"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.itemName)} fullWidth>
                          <InputLabel required>Item Name</InputLabel>
                          <OutlinedInput {...field} label="Item Name" />
                          {errors.itemName ? <FormHelperText>{errors.itemName.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <Controller
                      control={control}
                      name="quantity"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.quantity)} fullWidth>
                          <InputLabel required>Quantity</InputLabel>
                          <OutlinedInput
                            {...field}
                            label="Quantity"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            type="number"
                          />
                          {errors.quantity ? <FormHelperText>{errors.quantity.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <Controller
                      control={control}
                      name="pricePerItem"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.pricePerItem)} fullWidth>
                          <InputLabel required>Price Per Item (₹)</InputLabel>
                          <OutlinedInput
                            {...field}
                            label="Price Per Item (₹)"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            startAdornment="₹"
                            type="number"
                          />
                          {errors.pricePerItem ? <FormHelperText>{errors.pricePerItem.message}</FormHelperText> : null}
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
                  >
                    {editingItem ? 'Update Inventory Item' : 'Add Inventory Item'}
                  </LoadingButton>
                </Box>
              </CardContent>
            </Card>
          </form>
        )}
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price Per Item (₹)</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">Loading inventory items...</Typography>
                  </TableCell>
                </TableRow>
              ) : inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.pricePerItem?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>₹{(item.quantity * (item.pricePerItem || 0)).toFixed(2)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button 
                          size="small" 
                          startIcon={<PencilIcon />} 
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<TrashIcon />} 
                          color="error"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">No inventory items found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}