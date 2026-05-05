"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Autocomplete,
  Chip,
  Avatar,
} from '@mui/material';
import { Save, Video, Mail, Phone, Calendar, MapPin, GraduationCap, Briefcase, Book, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  joinLink: string;
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
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: 2 }}>No profile information available.</Alert>
      </Box>
    );
  }

  const renderField = (label: string, name: string, value: string | null | undefined, icon: React.ReactNode, editable = true, type = 'text') => (
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
        InputProps={{
          startAdornment: <Box sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.4)' }}>{icon}</Box>,
        }}
        sx={{
          '& .MuiInputBase-root': {
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 2,
            '&:before, &:after': { display: 'none' },
            '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.01)', color: 'rgba(255, 255, 255, 0.4)' },
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
            '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(99, 102, 241, 0.5)', boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)', '&.Mui-focused': { color: '#818cf8' } },
        }}
      />
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4, 
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        {/* Profile Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, mb: 6 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'rgba(99, 102, 241, 0.1)', 
                color: '#818cf8',
                fontSize: '3rem',
                fontWeight: 'bold',
                border: '2px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              {profile.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: '#10b981', width: 20, height: 20, borderRadius: '50%', border: '3px solid #030712' }} />
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
              {profile.fullName}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
              <Chip icon={<Mail size={14} />} label={profile.email} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <Chip icon={<Briefcase size={14} />} label={`${profile.experience} Experience`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />} 
            onClick={handleSave} 
            disabled={isSaving}
            sx={{ 
              bgcolor: '#6366f1', 
              '&:hover': { bgcolor: '#4f46e5' },
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        <Divider sx={{ mb: 6, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {/* Personal Info */}
          <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <UserIcon size={20} className="text-indigo-400" /> Personal Information
            </Typography>
          </Box>
          {renderField('Full Name', 'fullName', profile.fullName, <UserIcon size={18} />)}
          {renderField('Email', 'email', profile.email, <Mail size={18} />, false)}
          {renderField('Mobile Number', 'mobile', profile.mobile, <Phone size={18} />)}
          {renderField('Date of Birth', 'dateOfBirth', profile.dateOfBirth, <Calendar size={18} />, true, 'date')}

          {/* Professional Info */}
          <Box sx={{ width: '100%', px: 1.5, mt: 4, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <GraduationCap size={20} className="text-emerald-400" /> Professional Details
            </Typography>
          </Box>
          {renderField('Highest Qualification', 'qualification', profile.qualification, <GraduationCap size={18} />)}
          {renderField('Years of Experience', 'experience', profile.experience, <Briefcase size={18} />)}
          
          <Box sx={{ p: 1.5, width: '100%' }}>
            <TextField
              label={profile.joinLink ? "Meeting Link (G-Meet/Zoom)" : "Add Personal Meeting Link"}
              name="joinLink"
              value={profile.joinLink || ''}
              onChange={handleInputChange}
              fullWidth
              variant="filled"
              placeholder="https://meet.google.com/..."
              helperText="This link will be used when admins assign you new courses."
              InputProps={{
                startAdornment: <Box sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.4)' }}><Video size={18} /></Box>,
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  '&:before, &:after': { display: 'none' },
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.4)' }
              }}
            />
          </Box>

          <Box sx={{ p: 1.5, width: '100%' }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Book size={18} className="text-pink-400" />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>Subjects You Teach</Typography>
            </Box>
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
                  return <Chip key={key} variant="outlined" label={option} {...tagProps} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.03)' }} />;
                })
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="filled" 
                  placeholder="Type a subject and press Enter" 
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      '&:before, &:after': { display: 'none' },
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* Address */}
          <Box sx={{ width: '100%', px: 1.5, mt: 4, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <MapPin size={20} className="text-amber-400" /> Address Details
            </Typography>
          </Box>
          {renderField('Street', 'address.street', profile.address.street, <MapPin size={18} />)}
          {renderField('City', 'address.city', profile.address.city, <MapPin size={18} />)}
          {renderField('State', 'address.state', profile.address.state, <MapPin size={18} />)}
        </Box>
      </Box>
    </motion.div>
  );
};

export default TeacherProfilePage;
