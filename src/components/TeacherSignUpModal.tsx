'use client';

import { signIn } from 'next-auth/react';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress'; 
import { Alert, Autocomplete, Chip, Stack } from '@mui/material';
import { Camera, FileText, School, Edit, Plus } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../app/get-a-free-trial/phone-input.css';
import ReCAPTCHA from 'react-google-recaptcha';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '92%', md: '90%' },
  maxWidth: 850,
  maxHeight: '92vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  overflow: 'hidden',
};

const textFieldStyles = {
  '& .MuiInputBase-input': { color: 'text.primary' },
  '& .MuiInputLabel-root': { color: 'text.secondary' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: '#3b82f6' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
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
  const [joinLink, setJoinLink] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [listOfSubjects, setListOfSubjects] = useState<string[]>([]);
  const [subjectInputValue, setSubjectInputValue] = useState('');
  const [aboutTeacher, setAboutTeacher] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [width, setWidth] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePhoneChange = (value: string | undefined) => {
    setMobile(value || '');
  };

  const handleAddSubject = () => {
    const subject = subjectInputValue.trim();
    if (subject) {
      if (!listOfSubjects.includes(subject)) {
        setListOfSubjects((prev) => [...prev, subject]);
      }
      setSubjectInputValue('');
    }
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

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      setLoading(false);
      return;
    }

    if (!profileImageFile) {
      setError('Profile photo is required.');
      setLoading(false);
      return;
    }

    if (cvUrl.trim() && !cvUrl.includes('drive.google.com')) {
      setError('Please provide a valid Google Drive link for your CV.');
      setLoading(false);
      return;
    }

    if (!aboutTeacher.trim()) {
      setError('Please write a short description about yourself.');
      setLoading(false);
      return;
    }

    try {
      const roleCheckRes = await fetch('/api/auth/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!roleCheckRes.ok && roleCheckRes.status !== 404) {
        const errorData = await roleCheckRes.json();
        throw new Error('Failed to check user status.');
      }

      if (roleCheckRes.status === 200) {
        const { role } = await roleCheckRes.json();
        if (role === 'teacher') {
          throw new Error('You are already registered as a teacher. Please log in instead.');
        }
      }
      
      const profileImageUrl = await handleFileUpload(profileImageFile, 'image');
      if (!profileImageUrl) {
        setLoading(false);
        return;
      }

      let finalSubjects = [...listOfSubjects];
      if (subjectInputValue.trim() && !listOfSubjects.includes(subjectInputValue.trim())) {
        finalSubjects.push(subjectInputValue.trim());
      }

      const res = await fetch('/api/auth/teacher-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, email, mobile, qualification, experiance, listOfSubjects: finalSubjects, profileImage: profileImageUrl, cvUrl, aboutTeacher, joinLink, recaptchaToken
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep('otp');
      setTimer(30);
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
        <Box sx={{ 
          width: { xs: '100%', md: 300 }, 
          p: { xs: 3, md: 4 }, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
          color: 'primary.contrastText', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '150px', md: 'auto' }
        }}>
          <Box sx={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />
          
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', mb: 1 }}>
              <Image
                src="/logo.png"
                alt="Tuition-ed Logo"
                width={width && width < 600 ? 50 : 80}
                height={width && width < 600 ? 50 : 80}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography variant={width && width < 600 ? "h5" : "h4"} component="h2" sx={{ mt: { xs: 1, md: 2 }, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Join Our Team
            </Typography>
            <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.3)', my: { xs: 1.5, md: 2 }, mx: 'auto', borderRadius: 2 }} />
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              Share your knowledge and inspire the next generation of learners.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          p: { xs: 2.5, sm: 3.5, md: 4 }, 
          position: 'relative', 
          flex: 1,
          width: { xs: '100%', md: 540 }, 
          bgcolor: 'background.paper',
          color: 'text.primary',
          overflowY: 'auto',
          maxHeight: { xs: 'calc(92vh - 120px)', md: '92vh' },
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12, color: 'grey.500', zIndex: 10 }}><X size={20} /></IconButton>
          {step === 'details' && (
            <Box component="form" sx={{ mt: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h3" mb={2} fontWeight={700}>Become a Teacher</Typography>
              {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'error.dark', color: 'white' }}>{error}</Alert>}
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, width: '100%' }}>
                {/* Full Name */}
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <TextField label="Full Name" variant="outlined" fullWidth required value={fullName} onChange={(e) => setFullName(e.target.value)} sx={textFieldStyles} />
                </Box>

                {/* Email & Mobile */}
                <Box>
                  <TextField label="Email ID" variant="outlined" fullWidth required type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={textFieldStyles} />
                </Box>
                <Box>
                  <PhoneInput
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={handlePhoneChange}
                    international
                    className="phone-input-container"
                  />
                </Box>

                {/* Qualification & Experience */}
                <Box>
                  <TextField label="Highest Qualification" variant="outlined" fullWidth value={qualification} onChange={(e) => setQualification(e.target.value)} sx={textFieldStyles} />
                </Box>
                <Box>
                  <TextField label="Years of Experience" variant="outlined" fullWidth value={experiance} onChange={(e) => setExperiance(e.target.value)} sx={textFieldStyles} />
                </Box>

                {/* Meeting Link & CV Link */}
                <Box>
                  <TextField label="Default Meeting Link (e.g. G-Meet)" placeholder="https://meet.google.com/..." variant="outlined" fullWidth value={joinLink} onChange={(e) => setJoinLink(e.target.value)} sx={textFieldStyles} />
                </Box>
                <Box>
                  <TextField label="Google Drive CV Link (Optional)" placeholder="Paste CV link" variant="outlined" fullWidth value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} sx={textFieldStyles} />
                </Box>

                {/* Subjects You Teach */}
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={listOfSubjects}
                      inputValue={subjectInputValue}
                      onInputChange={(event, newInputValue, reason) => {
                        if (newInputValue.includes(',')) {
                          const parts = newInputValue.split(',');
                          const lastPart = parts.pop() || '';
                          const newSubjects = parts
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);

                          if (newSubjects.length > 0) {
                            setListOfSubjects((prev) => {
                              const unique = newSubjects.filter((s) => !prev.includes(s));
                              return [...prev, ...unique];
                            });
                          }
                          setSubjectInputValue(lastPart.trimStart());
                          return;
                        }
                        setSubjectInputValue(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        setListOfSubjects(newValue);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === ',' || event.key === 'Enter') {
                          event.preventDefault();
                          handleAddSubject();
                        }
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return <Chip key={key} variant="outlined" size="small" label={option} {...tagProps} sx={{ color: 'text.primary', borderColor: 'divider' }} />;
                        })
                      }
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Subjects You Teach" placeholder="Type a subject..." sx={textFieldStyles} />
                      )}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={handleAddSubject}
                      disabled={!subjectInputValue.trim() || listOfSubjects.includes(subjectInputValue.trim())}
                      sx={{
                        color: 'white',
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        mt: 1,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'scale(1.05)'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                          color: 'action.disabled'
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}
                      title="Add subject"
                    >
                      <Plus size={20} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Profile Photo & Bio */}
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} id="profile-image-input" />
                  <label htmlFor="profile-image-input">
                    <Box
                      sx={{
                        width: 110, height: 110, borderRadius: 2, border: '2px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      {!imagePreview && <Camera className="text-gray-400" />}
                    </Box>
                  </label>
                  {imagePreview ? (
                    <Button size="small" onClick={handleRemoveImage} sx={{ mt: 0.5, textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}>
                      Remove Image
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>Upload Profile Photo *</Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit size={14} />}
                    onClick={() => setIsAboutModalOpen(true)}
                    sx={{ mt: 1, textTransform: 'none', fontSize: '0.8rem', borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main' } }}
                  >
                    {aboutTeacher ? "Edit Bio" : "Write Bio"}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                my: 2.5,
                '& > div': { 
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}>
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="dark"
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={loading}
                fullWidth
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { bgcolor: 'primary.dark' },
                  borderRadius: 2
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Get OTP'}
              </Button>
            </Box>
          )}
          {step === 'otp' && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
              <Typography variant="h6" component="h3">Enter OTP</Typography> {error && <Typography color="error" variant="body2">{error}</Typography>}<Typography variant="body2" sx={{ color: 'text.secondary' }}>An OTP has been sent to {email}.</Typography>
              <TextField
                label="OTP"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={textFieldStyles}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5rem' } }}
              />
              <Button variant="contained" onClick={handleSignUp} disabled={loading} sx={{ mt: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, py: 1.5, borderRadius: 2 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="text" 
                  onClick={handleVerify} 
                  disabled={timer > 0 || loading} 
                  sx={{ color: 'primary.main', textTransform: 'none' }}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* About Teacher Modal */}
        <Dialog open={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary' } }}>
          <DialogTitle>About Yourself</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="about"
              label="Short Bio"
              placeholder="Tell students about your teaching style and experience..."
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={aboutTeacher}
              onChange={(e) => setAboutTeacher(e.target.value)}
              sx={textFieldStyles}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAboutModalOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button onClick={() => setIsAboutModalOpen(false)} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default TeacherSignUpModal;