"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Send, 
  Mail, 
  Users, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  UserPlus,
  ShieldCheck,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

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
               <h1 style="color: #6366f1; margin: 0;">TuitionEd</h1>
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
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex' }}>
                <Mail size={24} />
              </Box>
              <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 800, letterSpacing: '0.15em' }}>
                COMMUNICATIONS ENGINE
              </Typography>
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{ color: 'white', tracking: '-0.04em', mb: 1.5 }}>
              Bulk <span className="text-indigo-500">Messaging</span>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: 700, fontWeight: 500, lineHeight: 1.6 }}>
              Reach your audience instantly. Compose broadcast messages for students, teachers, or specific groups. Support for <b>[Name]</b> personalization is enabled.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
             <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                <Send size={40} />
             </Avatar>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Quick View */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr', lg: 'repeat(7, 1fr)' }, 
        gap: 3, 
        mb: 8 
      }}>
        {recipientGroups.map((group, idx) => (
          <motion.div key={group.value} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
            <Box sx={{ 
              p: 2.5, 
              bgcolor: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', borderColor: `${group.color}40` }
            }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${group.color}15`, color: group.color, display: 'flex' }}>
                 {group.icon}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.label.split(' ')[0]}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'white' }}>
                  {statsLoading ? <CircularProgress size={16} sx={{ color: group.color }} /> : (stats?.[group.value] || 0)}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Integrated Composer Layout */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
        gap: 6 
      }}>
        {/* Main Composer Section */}
        <Box>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Box sx={{ 
              p: { xs: 3, md: 6 }, 
              bgcolor: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: 8, 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    SELECT RECIPIENT GROUP
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                      displayEmpty
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        color: 'white',
                        borderRadius: 4,
                        h: 70,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                        '& .MuiSelect-select': { py: 2, px: 3 }
                      }}
                      renderValue={(selected) => {
                        if (!selected) return <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontWeight: 500 }}>Choose who will receive this message...</span>;
                        const group = recipientGroups.find(g => g.value === selected);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: group?.color }}>{group?.icon}</Box>
                            <Typography sx={{ fontWeight: 700 }}>{group?.label}</Typography>
                            {stats && <Badge variant="outline" className="ml-auto bg-white/5 border-white/10 text-gray-400 font-bold px-3">{(stats as any)[selected as string] || 0} Users</Badge>}
                          </Box>
                        );
                      }}
                    >
                      {recipientGroups.map((group) => (
                        <MenuItem key={group.value} value={group.value} sx={{ py: 2, px: 3 }}>
                          <ListItemIcon sx={{ color: group.color }}>{group.icon}</ListItemIcon>
                          <ListItemText 
                            primary={<Typography fontWeight="700">{group.label}</Typography>} 
                            secondary={stats ? `${stats[group.value] || 0} active recipients` : 'Calculating...'} 
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    CAMPAIGN SUBJECT
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter a compelling subject line..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    variant="outlined"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      '& .MuiOutlinedInput-root': { borderRadius: 4, h: 70 },
                      input: { color: 'white', fontWeight: 600, px: 3 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    MESSAGE CONTENT (HTML SUPPORTED)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    placeholder="Type your message here. Use [Name] for personalization..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="outlined"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      '& .MuiOutlinedInput-root': { borderRadius: 4, p: 3 },
                      '& .MuiOutlinedInput-input': { color: 'white', lineHeight: 1.7, fontWeight: 500 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
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
                      py: 2.5,
                      borderRadius: 4,
                      fontWeight: 900,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      letterSpacing: '0.02em',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.4)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.5)',
                      },
                      '&.Mui-disabled': { 
                        bgcolor: 'rgba(99, 102, 241, 0.1)', 
                        color: 'rgba(255,255,255,0.2)' 
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <Send size={22} />}
                  >
                    {loading ? 'TRANSMITTING BROADCAST...' : `SEND BROADCAST TO ${selectedGroup ? selectedGroup.label.toUpperCase() : 'GROUP'}`}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </motion.div>
        </Box>

        {/* Integrated Sidebar Section */}
        <Box>
          <Stack spacing={4}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Box sx={{ 
                p: 4, 
                bgcolor: 'rgba(99, 102, 241, 0.05)', 
                border: '1px solid rgba(99, 102, 241, 0.1)', 
                borderRadius: 6 
              }}>
                <Typography variant="h6" fontWeight="900" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, color: '#818cf8' }}>
                  <Info size={24} /> Best Practices
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', gap: 2.5 }}>
                     <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                     <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.6 }}>
                       Use <b>[Name]</b> anywhere in your message to automatically insert each recipient's full name.
                     </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2.5 }}>
                     <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                     <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.6 }}>
                       Craft engaging subjects. A clear, concise subject line significantly increases engagement rates.
                     </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2.5 }}>
                     <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                     <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.6 }}>
                       Double-check your recipient group. Broadcasting to <b>All Users</b> should be reserved for critical updates.
                     </Typography>
                  </Box>
                </Stack>
              </Box>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Box sx={{ 
                p: 4, 
                bgcolor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 6 
              }}>
                <Typography variant="h6" fontWeight="900" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                  <BarChart3 size={24} className="text-indigo-400" /> Transmission Log
                </Typography>
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.2 }}>
                   <Mail size={56} style={{ marginBottom: 16, margin: '0 auto' }} />
                   <Typography variant="subtitle2" fontWeight="700">No transmission history found</Typography>
                   <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Recently sent campaigns will appear here.</Typography>
                </Box>
              </Box>
            </motion.div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
