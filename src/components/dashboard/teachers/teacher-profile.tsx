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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { LoadingButton } from '@/components/core/loading-button';
import { Button, Stack } from '@mui/material';
import { updateTeacher } from '@/services/teacher-service';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  branchNames: zod.array(zod.string()).min(1, { message: 'At least one branch is required' }),
  education: zod.string().min(1, { message: 'Education is required' }),
  marksheet: zod.string().optional(),
  role: zod.enum(['TEACHER']),
  invoice: zod.string().optional(),
  paymentType: zod.enum(['cash', 'card', 'online', 'cheque']),
});

type Values = zod.infer<typeof schema>;

interface TeacherProfileProps {
  teacher: any;
  onUpdate: (updatedTeacher: any) => void;
}

export function TeacherProfile({ teacher, onUpdate }: TeacherProfileProps): React.JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(teacher.profilePicture || null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues = {
    firstName: teacher.firstName || '',
    lastName: teacher.lastName || '',
    email: teacher.email || '',
    branchNames: teacher.branchNames || [''],
    education: teacher.education || '',
    marksheet: teacher.marksheet || '',
    role: (teacher.role as 'TEACHER') || 'TEACHER',
    invoice: teacher.invoice || '',
    paymentType: teacher.paymentType || 'cash',
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema) as any
  });

  // Handle profile picture preview
  React.useEffect(() => {
    if (profilePictureFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(profilePictureFile);
    }
  }, [profilePictureFile]);

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      try {
        // Prepare data to match backend TeacherRequests DTO
        const requestData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: teacher.password || '', // Include password field
          paymentType: data.paymentType,
          branchName: data.branchNames,
          education: data.education,
          markshit: data.marksheet,
          invoice: data.invoice,
          profilePicture: profilePicturePreview || teacher.profilePicture,
        };
        
        // Make API call to update teacher
        const responseData = await updateTeacher(teacher.id, requestData);
        
        // Update parent component
        onUpdate({
          ...teacher,
          ...data,
          profilePicture: profilePicturePreview || teacher.profilePicture,
        });
        
        // Show success popup
        Swal.fire({
          title: 'Success!',
          text: 'Teacher updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating teacher:', error);
        // Show error popup
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update teacher. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [teacher, onUpdate, profilePicturePreview, isSubmitting]
  );

  const handleCancel = () => {
    reset(defaultValues);
    setProfilePictureFile(null);
    setProfilePicturePreview(teacher.profilePicture || null);
    setIsEditing(false);
  };

  const handleAddBranch = () => {
    const currentBranches = control._formValues.branchNames || [];
    const newBranches = [...currentBranches, ''];
    reset({ ...control._formValues, branchNames: newBranches });
  };

  const handleBranchChange = (index: number, value: string) => {
    const currentBranches = control._formValues.branchNames || [];
    const newBranches = [...currentBranches];
    newBranches[index] = value;
    reset({ ...control._formValues, branchNames: newBranches });
  };

  const handleRemoveBranch = (index: number) => {
    const currentBranches = control._formValues.branchNames || [];
    if (currentBranches.length <= 1) return;
    const newBranches = currentBranches.filter((_: any, i: number) => i !== index);
    reset({ ...control._formValues, branchNames: newBranches });
  };

  return (
    <Card>
      <CardHeader 
        title="Teacher Profile" 
        subheader={`ID: ${teacher.id}`}
        action={
          !isEditing ? (
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Profile Picture Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile Preview"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '3px solid #f0f0f0',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #f0f0f0',
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 auto',
                  }}
                >
                  No Image
                </Box>
              )}
              
              {isEditing && (
                <Box mt={2}>
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ accept: 'image/*' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProfilePictureFile(e.target.files?.[0] || null)
                    }
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Upload a new profile picture
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Profile Information Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            {isEditing ? (
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
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2">Branch Names</Typography>
                  <Stack spacing={2}>
                    {control._formValues.branchNames?.map((branch: string, index: number) => (
                      <Stack direction="row" key={index} spacing={2}>
                        <TextField
                          fullWidth
                          value={branch}
                          onChange={(e) => handleBranchChange(index, e.target.value)}
                          placeholder={`Branch ${index + 1}`}
                        />
                        {control._formValues.branchNames.length > 1 && (
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
                        <Select {...field} label="Role" value={field.value} disabled>
                          <MenuItem value="TEACHER">Teacher</MenuItem>
                        </Select>
                        {errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <LoadingButton 
                      loading={isSubmitting} 
                      type="submit" 
                      variant="contained" 
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </LoadingButton>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                  <Typography>{teacher.firstName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                  <Typography>{teacher.lastName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{teacher.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                  <Typography>{teacher.role}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">Branch Names</Typography>
                  <Typography>{teacher.branchNames?.join(', ') || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Education</Typography>
                  <Typography>{teacher.education || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Marksheet</Typography>
                  <Typography>{teacher.marksheet || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Invoice</Typography>
                  <Typography>{teacher.invoice || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Payment Type</Typography>
                  <Typography>{teacher.paymentType || 'N/A'}</Typography>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}