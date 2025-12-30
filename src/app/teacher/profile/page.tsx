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
  Autocomplete,
  Chip,
} from '@mui/material';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

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
  qualification: string;
  experience: string;
  listOfSubjects: string[];
}

const TeacherProfilePage = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/teacher-profile');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch profile.');
        }
        if (data.profile.dateOfBirth) {
          data.profile.dateOfBirth = new Date(data.profile.dateOfBirth).toISOString().split('T')[0];
        }
        setProfile(data.profile);
        setInitialProfile(data.profile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [session, status]);

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
      const res = await fetch('/api/teacher-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save profile.');
      }

      toast.success('Profile updated successfully!');
      setInitialProfile(profile);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
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
        variant="filled"
        disabled={!editable}
        type={type}
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiInputBase-root.Mui-disabled': { backgroundColor: '#374151' },
        }}
      />
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
        <Button variant="contained" startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />} onClick={handleSave} disabled={isSaving}>
          Save Changes
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {renderField('Full Name', 'fullName', profile.fullName)}
        {renderField('Email', 'email', profile.email, false)}
        {renderField('Mobile Number', 'mobile', profile.mobile)}
        {renderField('Date of Birth', 'dateOfBirth', profile.dateOfBirth, true, 'date')}

        <Box sx={{ width: '100%', px: 1.5 }}><Divider sx={{ my: 1 }}><Typography variant="overline">Professional Info</Typography></Divider></Box>

        {renderField('Highest Qualification', 'qualification', profile.qualification)}
        {renderField('Years of Experience', 'experience', profile.experience)}

        <Box sx={{ p: 1.5, width: '100%' }}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={profile.listOfSubjects}
            onChange={(event, newValue) => {
              if (profile) setProfile({ ...profile, listOfSubjects: newValue });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip key={key} variant="outlined" label={option} {...tagProps} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} variant="filled" label="Subjects You Teach" placeholder="Type a subject and press Enter" />
            )}
          />
        </Box>

        <Box sx={{ width: '100%', px: 1.5 }}><Divider sx={{ my: 1 }}><Typography variant="overline">Address</Typography></Divider></Box>

        {renderField('Street', 'address.street', profile.address.street)}
        {renderField('City', 'address.city', profile.address.city)}
        {renderField('State', 'address.state', profile.address.state)}
      </Box>
    </Paper>
  );
};

export default TeacherProfilePage;
