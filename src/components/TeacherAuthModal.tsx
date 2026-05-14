'use client';

import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Briefcase, X } from 'lucide-react';
import { useUI } from '@/provider/UIProvider';
import { Stack, Divider } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: 'auto' }, // Adjusted for flex layout
  maxWidth: 800,
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0, // Padding will be applied to inner boxes
  borderRadius: 2,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  overflow: { xs: 'auto', md: 'hidden' },
};

interface TeacherAuthModalProps {
  open: boolean;
  onClose: () => void;
}

const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ open, onClose }) => {
  const { switchModal } = useUI();

  const [width, setWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSignInClick = () => {
    switchModal('teacherSignin');
  };

  const handleSignUpClick = () => {
    switchModal('teacherSignup');
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="teacher-auth-modal-title">
      <Box sx={style}>
        {/* Left Side */}
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
          <Briefcase size={width && width < 600 ? 40 : 64} />
          <Typography variant={width && width < 600 ? "h5" : "h4"} component="h2" sx={{ mt: { xs: 1, md: 2 }, fontWeight: 'bold' }}>
            Teacher Portal
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
            Access your dashboard or join our team of educators.
          </Typography>
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
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500' }}>
            <X />
          </IconButton>
          <Typography id="teacher-auth-modal-title" variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
            Are you new or returning?
          </Typography>
          <Stack spacing={3} sx={{ mt: 4 }}>
            <Button variant="outlined" color="secondary" size="large" onClick={handleSignInClick}>
              Login as Teacher
            </Button>
            <Divider sx={{ color: 'grey.600' }}>OR</Divider>
            <Button variant="contained" size="large" onClick={handleSignUpClick}>
              Register as a New Teacher
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default TeacherAuthModal;