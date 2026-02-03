"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material'; // Removed the extra comma here
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileData {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string | null;
  address: {
    street: string;
    city: string;
    state: string;
  };
  grade: string;
  fatherName: string;
}

function ProfileSkeleton() {
  return (
    <Paper
      elevation={0}
      className="border-2 border-blue-500"
      sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#1f2937' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton className="h-10 w-48 bg-gray-700" />
        <Skeleton className="h-10 w-32 bg-gray-700" />
      </Box>

      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ p: 1.5, width: { xs: '100%', sm: '50%' } }}>
            <Skeleton className="h-14 w-full bg-gray-700 rounded-md" />
          </Box>
        ))}
        
        <Box sx={{ width: '100%', px: 1.5, py: 2 }}>
             <div className="flex items-center gap-4">
                <Skeleton className="h-[1px] flex-1 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-[1px] flex-1 bg-gray-700" />
             </div>
        </Box>

        {[1, 2].map((i) => (
          <Box key={`add-${i}`} sx={{ p: 1.5, width: { xs: '100%', sm: '50%' } }}>
            <Skeleton className="h-14 w-full bg-gray-700 rounded-md" />
          </Box>
        ))}

        <Box sx={{ width: '100%', px: 1.5, py: 2 }}>
             <div className="flex items-center gap-4">
                <Skeleton className="h-[1px] flex-1 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-[1px] flex-1 bg-gray-700" />
             </div>
        </Box>

        {[1, 2, 3].map((i) => (
          <Box key={`addr-${i}`} sx={{ p: 1.5, width: { xs: '100%', sm: '50%' } }}>
            <Skeleton className="h-14 w-full bg-gray-700 rounded-md" />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

const StudentProfilePage = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/student-profile');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch profile.');
        }
        // Format date for input field
        if (data.profile.dateOfBirth) {
          data.profile.dateOfBirth = new Date(data.profile.dateOfBirth).toISOString().split('T')[0];
        }
        setProfile(data.profile);
        setInitialProfile(data.profile); // Store initial state for cancellation
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!profile) return;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: { ...(profile[parent as keyof ProfileData] as object), [child]: value },
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/student-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          mobile: profile.mobile,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address,
          grade: profile.grade,
          fatherName: profile.fatherName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save profile.');
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setInitialProfile(profile); // Update initial state to new saved state
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile); // Revert changes
    setIsEditing(false);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error && !profile) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!profile) {
    return <Alert severity="info" sx={{ m: 4 }}>No profile information available.</Alert>;
  }

  const renderField = (label: string, name: string, value: string | null | undefined, editable = true, type = 'text') => (
    <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%' } }}>
        <TextField
            label={label}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            disabled={!isEditing || !editable}
            type={type}
            InputLabelProps={{ shrink: true }}
            sx={{
                '& .MuiInputBase-root.Mui-disabled': {
                    backgroundColor: '#374151', // gray-700
                },
            }} />
    </Box>
  );

  return (
    <Paper
      elevation={0}
      className="border-2 border-blue-500"
      sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#1f2937' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          My Profile
        </Typography>
        {!isEditing ? (
          <Button variant="contained" startIcon={<Edit />} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="secondary" startIcon={<X />} onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />} onClick={handleSave} disabled={isSaving}>
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {renderField('Full Name', 'fullName', profile.fullName)}
        {renderField('Email', 'email', profile.email, false)}
        {renderField('Mobile Number', 'mobile', profile.mobile)}
        {renderField('Date of Birth', 'dateOfBirth', profile.dateOfBirth, true, 'date')}
        
        <Box sx={{ width: '100%', px: 1.5 }}><Divider sx={{ my: 1 }}><Typography variant="overline">Additional Info</Typography></Divider></Box>

        {renderField('Father\'s Name', 'fatherName', profile.fatherName)}
        {renderField('Grade', 'grade', profile.grade)}

        <Box sx={{ width: '100%', px: 1.5 }}><Divider sx={{ my: 1 }}><Typography variant="overline">Address</Typography></Divider></Box>

        {renderField('Street', 'address.street', profile.address.street)}
        {renderField('City', 'address.city', profile.address.city)}
        {renderField('State', 'address.state', profile.address.state)}
      </Box>
    </Paper>
  );
};

export default StudentProfilePage;
