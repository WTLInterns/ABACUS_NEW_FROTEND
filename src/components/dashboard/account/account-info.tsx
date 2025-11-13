'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
    const { user } = useUser();
    const [profilePicture, setProfilePicture] = React.useState<string | null>(user?.avatar ?? null);
    const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePicture = () => {
        // In a real app, you would upload the file to the server here
        console.log('Saving profile picture:', profilePictureFile);
        // For now, we'll just show a success message
        alert('Profile picture updated successfully!');
    };

    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '';
    const displayLocation = user?.city ? `${user.city}, ${user.country || ''}` : '';
    const displayTimezone = user?.timezone || '';

    return (
        <Card>
            <CardContent>
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <div>
                        <Avatar 
                            src={profilePicture ?? '/assets/avatar.png'} 
                            sx={{ height: '80px', width: '80px' }} 
                        />
                    </div>
                    <Stack spacing={1} sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{displayName}</Typography>
                        <Typography color="text.secondary" variant="body2">
                            {displayLocation}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {displayTimezone as string}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
            <Divider />
            <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                <Button fullWidth variant="text" component="label">
                    Upload picture
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </Button>
                {profilePictureFile && (
                    <Button fullWidth variant="contained" onClick={handleSavePicture}>
                        Save Picture
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}