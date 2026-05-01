"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Paper,
  Avatar,
  IconButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Send, 
  Mail, 
  Users, 
  Info, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  UserPlus,
  ShieldCheck,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const recipientGroups = [
  { value: 'all', label: 'All Users', icon: <Users size={18} />, color: '#6366f1' },
  { value: 'student', label: 'All Students', icon: <GraduationCap size={18} />, color: '#3b82f6' },
  { value: 'approved_student', label: 'Approved Students', icon: <ShieldCheck size={18} />, color: '#10b981' },
  { value: 'teacher', label: 'All Teachers', icon: <Users size={18} />, color: '#f59e0b' },
  { value: 'approved_teacher', label: 'Approved Teachers', icon: <UserCheck size={18} />, color: '#8b5cf6' },
  { value: 'pending_teacher', label: 'Pending Teachers', icon: <AlertCircle size={18} />, color: '#ef4444' },
  { value: 'signup', label: 'Unverified Users', icon: <UserPlus size={18} />, color: '#ec4899' },
];

export default function BulkMailPage() {
  const [recipientType, setRecipientType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/bulk-email/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSendMail = async () => {
    if (!recipientType || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const id = toast.loading('Preparing to send emails...');
    
    try {
      const htmlContent = message.replace(/\n/g, '<br />');

      const response = await fetch('/api/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          subject,
          htmlContent: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 24px;">
               <h1 style="color: #3b82f6; margin: 0;">TuitionEd</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
              ${htmlContent}
            </div>
            <div style="margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated email from TuitionEd Admin. Please do not reply.
            </div>
          </div>`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, { id });
        setSubject('');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to send emails', { id });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id });
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = recipientGroups.find(g => g.value === recipientType);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '3rem' }
            }}>
              Bulk Email Communications
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600 }}>
              Communicate with your users effectively. Select a group, compose your message, and hit send. 
              Personalization is supported using the <b>[Name]</b> placeholder.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
             <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Mail size={32} color="#3b82f6" />
             </Avatar>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Quick View - Using CSS Grid instead of MUI Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
        gap: 2, 
        mb: 4 
      }}>
        {recipientGroups.slice(0, 4).map((group, idx) => (
          <motion.div
            key={group.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'rgba(31, 41, 55, 0.5)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              height: '100%'
            }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${group.color}20`, display: 'flex' }}>
                 {React.cloneElement(group.icon as React.ReactElement, { color: group.color })}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                  {group.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {statsLoading ? <CircularProgress size={16} /> : (stats?.[group.value] || 0)}
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* Layout - Using CSS Grid instead of MUI Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
        gap: 3 
      }}>
        {/* Main Composer */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ 
              bgcolor: '#111827', 
              color: 'white', 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      Choose Audience
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={recipientType}
                        onChange={(e) => setRecipientType(e.target.value)}
                        displayEmpty
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.03)',
                          color: 'white',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        }}
                        renderValue={(selected) => {
                          if (!selected) return <span style={{ color: 'rgba(255,255,255,0.3)' }}>Select recipient group...</span>;
                          const group = recipientGroups.find(g => g.value === selected);
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {group?.icon}
                              {group?.label}
                              {stats && <Typography variant="caption" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.1)', px: 1, borderRadius: 1 }}>
                                {stats[selected as string] || 0} users
                              </Typography>}
                            </Box>
                          );
                        }}
                      >
                        {recipientGroups.map((group) => (
                          <MenuItem key={group.value} value={group.value} sx={{ py: 1.5 }}>
                            <ListItemIcon sx={{ color: group.color }}>{group.icon}</ListItemIcon>
                            <ListItemText primary={group.label} secondary={stats ? `${stats[group.value] || 0} users` : 'Loading...'} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      Subject Line
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g. Weekly Updates, Important Announcement"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      variant="outlined"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        input: { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      Content
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={10}
                      placeholder="Hello [Name], we have some exciting news..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      variant="outlined"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        '& .MuiOutlinedInput-input': { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      }}
                    />
                  </Box>

                  <Box sx={{ pt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleSendMail}
                      disabled={loading}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        fontWeight: 800,
                        textTransform: 'none',
                        fontSize: '1rem',
                        background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                        '&:hover': { 
                          background: 'linear-gradient(45deg, #2563eb, #1d4ed8)',
                          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)',
                        },
                        '&.Mui-disabled': { 
                          bgcolor: 'rgba(59, 130, 246, 0.2)', 
                          color: 'rgba(255,255,255,0.3)' 
                        }
                      }}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                    >
                      {loading ? 'Transmitting...' : `Send to ${selectedGroup ? selectedGroup.label : 'Group'}`}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Info Sidebar */}
        <Box>
          <Stack spacing={3}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'white', borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#60a5fa' }}>
                    <Info size={20} /> Pro Tips
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                       <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                         Use <b>[Name]</b> to inject the user's full name automatically.
                       </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                       <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                         Keep your subject lines short and engaging to improve open rates.
                       </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                       <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                         Review the audience count before sending to avoid accidental bulk spam.
                       </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChart3 size={20} color="#a78bfa" /> Sending History
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                     <Mail size={40} style={{ marginBottom: 8 }} />
                     <Typography variant="body2">No recent bulk emails sent</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
