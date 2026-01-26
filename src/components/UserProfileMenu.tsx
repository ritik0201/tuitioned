"use client"

import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface UserProfileMenuProps {
  userType?: 'admin' | 'student' | 'teacher';
  showDashboardLink?: boolean;
  dashboardHref?: string;
}

export default function UserProfileMenu({
  userType = 'student',
  showDashboardLink = true,
  dashboardHref
}: UserProfileMenuProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string = "") => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getDashboardHref = () => {
    if (dashboardHref) return dashboardHref;
    switch (userType) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/dashboard';
    }
  };

  const getProfileHref = () => {
    switch (userType) {
      case 'admin': return '/admin/students';
      case 'teacher': return '/teacher/demo-classes-assigned';
      case 'student': return '/student/courses';
      default: return '/profile';
    }
  };

  const getProfileLabel = () => {
    switch (userType) {
      case 'admin': return 'View All Students';
      case 'teacher': return 'View Allocated Courses';
      case 'student': return 'View Your Courses';
      default: return 'Profile';
    }
  };

  const user = session?.user;
  const userName = user?.fullName || user?.name || 'User';
  const userEmail = user?.email || '';
  const userInitial = getInitials(userName);

  return (
    <>
      <Box
        onClick={handleAvatarClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          p: 0.5,
          borderRadius: '50%',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          {userInitial}
        </Avatar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: '#1f2937',
            color: 'white',
            borderRadius: 2,
            minWidth: 280,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        {/* User Info Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                fontSize: '1.25rem'
              }}
            >
              {userInitial}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {userName}
              </Typography>
              <Chip
                label={userType.charAt(0).toUpperCase() + userType.slice(1)}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* User Details */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {userEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {userEmail}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Member since {new Date().getFullYear()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Menu Items */}
        {showDashboardLink && (
          <MenuItem
            component={Link}
            href={getDashboardHref()}
            onClick={handleMenuClose}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <LayoutDashboard size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          component={Link}
          href={getProfileHref()}
          onClick={handleMenuClose}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <User size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
          </ListItemIcon>
          <ListItemText>{getProfileLabel()}</ListItemText>
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogOut size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}