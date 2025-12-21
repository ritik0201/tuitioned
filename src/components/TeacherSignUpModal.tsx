'use client';

import { signIn } from 'next-auth/react';
import React, { useRef, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress'; 
import { Alert, Autocomplete, Chip, Stack } from '@mui/material';
import { Camera, FileText, School } from 'lucide-react';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../app/get-a-free-trial/phone-input.css';
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 'auto' },
  maxWidth: 800,
  bgcolor: '#1f2937', // bg-gray-800
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  overflow: 'hidden',
};

interface TeacherSignUpModalProps {
  open: boolean;
  onClose: () => void;
}

const TeacherSignUpModal: React.FC<TeacherSignUpModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [qualification, setQualification] = useState('');
  const [experiance, setExperiance] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [listOfSubjects, setListOfSubjects] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textFieldStyles = {
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
      '&:hover fieldset': { borderColor: '#fff' },
      '&.Mui-focused fieldset': { borderColor: '#fff' },
    },
  };

  const handlePhoneChange = (value: string | undefined) => {
    setMobile(value || '');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file: File, resourceType: 'image' | 'raw' | 'auto' = 'auto') => {
    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError("Cloudinary configuration is missing. Please check your environment variables.");
      setLoading(false);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const uploadPath = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
      const response = await fetch(uploadPath, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'Upload failed. Check Cloudinary preset and account settings.');
      }

      const data = await response.json();
      // Helpful debug: check resource_type and secure_url
      console.debug('Cloudinary upload response:', { resource_type: data.resource_type, secure_url: data.secure_url });
      return data.secure_url;
    } catch (uploadError: any) {
      console.error('Cloudinary Upload Error:', uploadError);
      setError(`Upload Error: ${uploadError.message}`);
      return null;
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    if (!profileImageFile) {
      setError('Profile photo is required.');
      setLoading(false);
      return;
    }

    if (!cvUrl.trim() || !cvUrl.includes('drive.google.com')) {
      setError('A valid Google Drive link for your CV is required.');
      setLoading(false);
      return;
    }

    try {
      const roleCheckRes = await fetch('/api/auth/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // A 404 is expected for a new user, so we only fail on other error codes.
      if (!roleCheckRes.ok && roleCheckRes.status !== 404) {
        const errorData = await roleCheckRes.json();
        throw new Error('Failed to check user status.');
      }

      // Only check the role if the user was found (status is not 404)
      if (roleCheckRes.status === 200) {
        const { role } = await roleCheckRes.json();
        if (role === 'teacher') {
          throw new Error('You are already registered as a teacher. Please log in instead.');
        }
      }
      
      // Upload image to Cloudinary and get the URL
      const profileImageUrl = await handleFileUpload(profileImageFile, 'image');
      if (!profileImageUrl) {
        // Error is already set in handleFileUpload
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/teacher-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, email, mobile, qualification, experiance, listOfSubjects, profileImage: profileImageUrl, cvUrl
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        otp,
        requiredRole: 'teacher',
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      if (result?.ok) {
        handleClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="teacher-signup-modal-title">
      <Box sx={style}>
        <Box sx={{ width: { xs: '100%', md: 300 }, p: 4, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <School size={64} />
          <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: 'bold' }}>
            Join Our Team
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Share your knowledge and inspire the next generation of learners.
          </Typography>
        </Box>
        <Box sx={{ p: 4, position: 'relative', width: { xs: '100%', md: 550 }, color: '#fff' }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500' }}><X /></IconButton>
          {step === 'details' && (
            <Box component="form" sx={{ mt: 4 }}>
              <Typography variant="h6" component="h3" mb={1}>Become a Teacher</Typography>
              {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'error.dark', color: 'white' }}>{error}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mt: 2.5 }}>
                {/* Left side for inputs */}
                <Stack spacing={2.5} sx={{ flex: 1 }}>
                  <TextField label="Full Name" variant="outlined" fullWidth required value={fullName} onChange={(e) => setFullName(e.target.value)} sx={textFieldStyles} />
                  <TextField label="Email ID" variant="outlined" fullWidth required type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={textFieldStyles} />
                  <PhoneInput
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={handlePhoneChange}
                    international
                    className="phone-input-container"
                  />
                  <TextField label="Highest Qualification" variant="outlined" fullWidth value={qualification} onChange={(e) => setQualification(e.target.value)} sx={textFieldStyles} />
                  <TextField label="Years of Experience" variant="outlined" fullWidth value={experiance} onChange={(e) => setExperiance(e.target.value)} sx={textFieldStyles} />
                  <TextField label="Google Drive CV Link" placeholder="Paste your CV link here" variant="outlined" fullWidth required value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} sx={textFieldStyles} />
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={listOfSubjects}
                    onChange={(event, newValue) => {
                      setListOfSubjects(newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return <Chip key={key} variant="outlined" label={option} {...tagProps} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} />;
                      })
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Subjects You Teach" placeholder="Type a subject and press Enter" sx={textFieldStyles} />
                    )}
                  />
                </Stack>
                {/* Right side for image */}
                <Stack spacing={2} sx={{ alignItems: 'center', pt: 2 }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} id="profile-image-input" />
                  <label htmlFor="profile-image-input">
                    <Box
                      sx={{
                        width: 140, height: 140, borderRadius: 2, border: '2px dashed rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      {!imagePreview && <Camera color="rgba(255, 255, 255, 0.7)" />}
                    </Box>
                  </label>
                  {imagePreview ? (
                    <Button size="small" onClick={handleRemoveImage} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>
                      Remove Image
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>Upload Profile Photo</Typography>
                  )}
                </Stack>
              </Box>
              <Button variant="contained" onClick={handleVerify} disabled={loading} fullWidth sx={{ mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Get OTP'}
              </Button>
            </Box>
          )}
          {step === 'otp' && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
              <Typography variant="h6" component="h3">Enter OTP</Typography> {error && <Typography color="error" variant="body2">{error}</Typography>}<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>An OTP has been sent to {email}.</Typography>
              <TextField
                label="OTP"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={textFieldStyles}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5rem' } }}
              />
              <Button variant="contained" onClick={handleSignUp} disabled={loading} sx={{ mt: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default TeacherSignUpModal;