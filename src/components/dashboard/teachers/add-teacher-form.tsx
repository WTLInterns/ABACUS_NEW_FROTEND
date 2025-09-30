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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
  branchNames: zod.array(zod.string()).min(1, { message: 'At least one branch is required' }),
  education: zod.string().min(1, { message: 'Education is required' }),
  marksheet: zod.string().optional(),
  role: zod.enum(['teacher', 'admin']),
  amountPaid: zod.number().min(0, { message: 'Amount paid must be a positive number' }),
  invoice: zod.string().optional(),
  paymentType: zod.enum(['cash', 'card', 'online', 'cheque']),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  branchNames: [''],
  education: '',
  marksheet: '',
  role: 'teacher' as const,
  amountPaid: 0,
  invoice: '',
  paymentType: 'cash' as const,
};

export function AddTeacherForm(): React.JSX.Element {
  const [branches, setBranches] = React.useState<string[]>(['']);
  const [teachers, setTeachers] = React.useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ 
    defaultValues, 
    resolver: zodResolver(schema) as any // Type assertion to avoid resolver type issues
  });

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      // Handle form submission
      console.log('Form values:', data);
      
      // Add to teachers list
      const newTeacher = {
        id: teachers.length + 1,
        ...data,
      };
      
      setTeachers([...teachers, newTeacher]);
      
      // Reset form
      reset(defaultValues);
      setBranches(['']);
    },
    [teachers, reset]
  );

  const handleAddBranch = () => {
    const newBranches = [...branches, ''];
    setBranches(newBranches);
  };

  const handleBranchChange = (index: number, value: string) => {
    const newBranches = [...branches];
    newBranches[index] = value;
    setBranches(newBranches);
  };

  const handleRemoveBranch = (index: number) => {
    if (branches.length <= 1) return;
    const newBranches = branches.filter((_, i) => i !== index);
    setBranches(newBranches);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardHeader title="Add New Teacher" sx={{ pb: 0 }} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)} fullWidth>
                    <InputLabel required>Password</InputLabel>
                    <OutlinedInput {...field} label="Password" type="password" />
                    {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">Branch Names</Typography>
              <Stack spacing={2}>
                {branches.map((branch, index) => (
                  <Stack direction="row" key={index} spacing={2}>
                    <TextField
                      fullWidth
                      value={branch}
                      onChange={(e) => handleBranchChange(index, e.target.value)}
                      placeholder={`Branch ${index + 1}`}
                    />
                    {branches.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveBranch(index)}
                        sx={{ minWidth: 'unset', width: 40, height: 40 }}
                      >
                        -
                      </Button>
                    )}
                  </Stack>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddBranch}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  + Add Branch
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="education"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.education)} fullWidth>
                    <InputLabel required>Education</InputLabel>
                    <OutlinedInput {...field} label="Education" />
                    {errors.education ? <FormHelperText>{errors.education.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="marksheet"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.marksheet)} fullWidth>
                    <InputLabel>Marksheet/Certification</InputLabel>
                    <OutlinedInput {...field} label="Marksheet/Certification" />
                    {errors.marksheet ? <FormHelperText>{errors.marksheet.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.role)} fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role" value={field.value}>
                      <MenuItem value="teacher">Teacher</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                    {errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="amountPaid"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.amountPaid)} fullWidth>
                    <InputLabel required>Amount Paid (₹)</InputLabel>
                    <OutlinedInput
                      {...field}
                      label="Amount Paid (₹)"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      type="number"
                    />
                    {errors.amountPaid ? <FormHelperText>{errors.amountPaid.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="invoice"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.invoice)} fullWidth>
                    <InputLabel>Invoice</InputLabel>
                    <OutlinedInput {...field} label="Invoice" />
                    {errors.invoice ? <FormHelperText>{errors.invoice.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="paymentType"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.paymentType)} fullWidth>
                    <InputLabel>Payment Type</InputLabel>
                    <Select {...field} label="Payment Type" value={field.value}>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="cheque">Cheque</MenuItem>
                    </Select>
                    {errors.paymentType ? <FormHelperText>{errors.paymentType.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button disabled={isSubmitting} type="submit" variant="contained" onClick={handleSubmit(onSubmit)}>
                  Add Teacher
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {teachers.length > 0 && (
        <Card>
          <CardHeader title="Recently Added Teachers" />
          <Divider />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell>Amount Paid (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.id}</TableCell>
                      <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.role}</TableCell>
                      <TableCell>{teacher.education}</TableCell>
                      <TableCell>₹{teacher.amountPaid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}