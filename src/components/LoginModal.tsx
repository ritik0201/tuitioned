'use client';

import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { LogIn, X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { Stack } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: 'auto' },
  maxWidth: 800,
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  overflow: { xs: 'auto', md: 'hidden' },
};

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSwitchToSignUp }) => {
  const router = useRouter();
  const [step, setStep] = useState('details');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const [width, setWidth] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const textFieldStyles = {
    '& .MuiInputBase-input': { color: '#fff' },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
      '&:hover fieldset': { borderColor: '#fff' },
      '&.Mui-focused fieldset': { borderColor: '#fff' },
    },
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      // First, check if the user is a student
      const roleCheckRes = await fetch('/api/auth/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const roleData = await roleCheckRes.json();

      if (!roleCheckRes.ok) {
        throw new Error(roleData.message || 'Failed to check user status.');
      }
      if (roleData.role !== 'student') {
        throw new Error('This login is for students only.');
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        otp,
        requiredRole: 'student', // This is the key change
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      if (result?.ok) {
        handleClose();
        router.push('/dashboard'); // Redirect on success
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
    <Modal open={open} onClose={handleClose} aria-labelledby="login-modal-title">
      <Box sx={style}>
        <Box sx={{ 
          width: { xs: '100%', md: 300 }, 
          p: { xs: 3, md: 4 }, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center',
          minHeight: { xs: '150px', md: 'auto' }
        }}>
          <LogIn size={width && width < 600 ? 40 : 64} />
          <Typography variant={width && width < 600 ? "h5" : "h4"} component="h2" sx={{ mt: { xs: 1, md: 2 }, fontWeight: 'bold' }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
            Sign in to continue your learning journey.
          </Typography>
        </Box>
        <Box sx={{ 
          p: { xs: 3, sm: 4 }, 
          position: 'relative', 
          width: { xs: '100%', md: 450 }, 
          bgcolor: '#1f2937', 
          color: '#fff',
          overflowY: { xs: 'visible', md: 'auto' },
          maxHeight: { xs: 'none', md: '95vh' }
        }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500' }}><X /></IconButton>
          {step === 'details' && (
            <Stack component="form" spacing={2.5} sx={{ mt: 4 }}>
              <Typography variant="h6" component="h3">Student Login</Typography>
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <TextField label="Email ID" variant="outlined" fullWidth required type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={textFieldStyles} />
              <Button variant="contained" onClick={handleVerify} disabled={loading} sx={{ mt: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>
            </Stack>
          )}
          {step === 'otp' && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
              <Typography variant="h6" component="h3">Enter OTP</Typography>
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                An OTP has been sent to {email}.
              </Typography>
              <TextField
                label="OTP"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={textFieldStyles}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5rem' } }}
              />
              <Button variant="contained" onClick={handleLogin} disabled={loading} sx={{ mt: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="text" 
                  onClick={handleVerify} 
                  disabled={timer > 0 || loading} 
                  sx={{ color: 'primary.light', textTransform: 'none' }}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </Button>
              </Box>
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Button variant="text" onClick={onSwitchToSignUp} sx={{ color: 'primary.light', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
              Sign Up
            </Button>
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default LoginModal;
