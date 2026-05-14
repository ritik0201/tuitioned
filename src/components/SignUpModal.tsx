'use client';

import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { UserPlus, X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/material';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../app/get-a-free-trial/phone-input.css';
import ReCAPTCHA from 'react-google-recaptcha';

interface SignUpModalProps {
    open: boolean;
    onClose: () => void;
}

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

const SignUpModal = ({ open, onClose }: SignUpModalProps) => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
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
        '& .MuiInputBase-input': {
            color: '#fff',
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
                borderColor: '#fff',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#fff',
            },
        },
    };

    const handlePhoneChange = (value: string | undefined) => {
        setMobile(value || '');
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');

        if (!mobile || mobile.length < 8 || mobile.length > 14) {
            setError('Please enter a valid mobile number.');
            setLoading(false);
            return;
        }

        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA verification.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, mobile, recaptchaToken }),
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
        setStep('details'); // Reset step when closing
        setError('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="signup-modal-title"
        >
            <Box sx={style}>
                {/* Left Side */}
                <Box sx={{ 
                    width: { xs: '100%', md: 300 }, 
                    p: { xs: 3, md: 4 }, 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', 
                    color: 'primary.contrastText', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: { xs: '180px', md: 'auto' }
                }}>
                    <Box sx={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
                    <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />
                    
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <UserPlus size={width && width < 600 ? 40 : 80} strokeWidth={1.5} />
                        <Typography variant={width && width < 600 ? "h5" : "h4"} component="h2" sx={{ mt: { xs: 1, md: 3 }, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Create Your Account
                        </Typography>
                        <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.3)', my: { xs: 1.5, md: 3 }, mx: 'auto', borderRadius: 2 }} />
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                            Start your learning journey with us.
                        </Typography>
                    </Box>
                </Box>

                {/* Right Side */}
                <Box sx={{ 
                    p: { xs: 3, sm: 4 }, 
                    position: 'relative', 
                    width: { xs: '100%', md: 450 }, 
                    bgcolor: '#1f2937', 
                    color: '#fff',
                    overflowY: { xs: 'visible', md: 'auto' },
                    maxHeight: { xs: 'none', md: '95vh' }
                }}>
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500' }}>
                        <X />
                    </IconButton>
                    {step === 'details' && (
                        <Stack component="form" spacing={2.5} sx={{ mt: 4 }}>
                            <Typography variant="h6" component="h3">Enter Your Details</Typography>
                            {error && <Typography color="error" variant="body2">{error}</Typography>}
                            <TextField label="Full Name" variant="outlined" fullWidth required value={fullName} onChange={(e) => setFullName(e.target.value)} sx={textFieldStyles} />
                            <TextField label="Email ID" variant="outlined" fullWidth required type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={textFieldStyles} />
                            <PhoneInput
                                placeholder="Mobile Number"
                                value={mobile}
                                onChange={handlePhoneChange}
                                international
                                className="phone-input-container"
                            />
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                my: 3,
                                '& > div': { 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
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
                                sx={{
                                    mt: 2,
                                    mb: 4,
                                    py: 1.8,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Get OTP'}
                            </Button>
                        </Stack>
                    )}

                    {step === 'otp' && (
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                            <Typography variant="h6" component="h3">Enter OTP</Typography> {error && <Typography color="error" variant="body2">{error}</Typography>}<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                            <Button
                                variant="contained"
                                onClick={handleSignUp}
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    py: 1.8,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
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
                </Box>
            </Box>
        </Modal>
    );
};

export default SignUpModal;