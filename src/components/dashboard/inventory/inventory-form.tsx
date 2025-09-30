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

export function InventoryForm(): React.JSX.Element {
  const [showForm, setShowForm] = React.useState(false);
  const [inventoryItems, setInventoryItems] = React.useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      // Handle form submission
      console.log('Form values:', data);
      
      // Add to inventory items list
      const newItem = {
        id: inventoryItems.length + 1,
        ...data,
        totalValue: data.quantity * data.pricePerItem,
      };
      
      setInventoryItems([...inventoryItems, newItem]);
      
      // Reset form and hide it
      reset(defaultValues);
      setShowForm(false);
    },
    [inventoryItems, reset]
  );

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      reset(defaultValues);
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
                  <Button disabled={isSubmitting} type="submit" variant="contained">
                    Add Inventory Item
                  </Button>
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
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.pricePerItem.toFixed(2)}</TableCell>
                    <TableCell>₹{item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<PencilIcon />}>
                          Edit
                        </Button>
                        <Button size="small" startIcon={<TrashIcon />} color="error">
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