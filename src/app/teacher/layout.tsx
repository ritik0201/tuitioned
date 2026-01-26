"use client"

import React, { useMemo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { LayoutDashboard, BookOpen, User, LogOut, Menu, ClipboardList, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserProfileMenu from '@/components/UserProfileMenu';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/teacher/dashboard' },
  { text: 'Courses', icon: <BookOpen size={20} />, href: '/teacher/courses' },
  { text: 'Demo Classes', icon: <ClipboardList size={20} />, href: '/teacher/demo-classes-assigned' },
  { text: 'Profile', icon: <User size={20} />, href: '/teacher/profile' },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [teacherStatus, setTeacherStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const { data: session } = useSession();

  const { userName, userInitial } = useMemo(() => {
    const name = session?.user?.fullName || 'User';
    return {
      userName: name,
      userInitial: name.charAt(0).toUpperCase(),
    };
  }, [session]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/teachers/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (res.ok) {
            const data = await res.json();
            setTeacherStatus(data.teacherStatus);
          }
        } catch (error) {
          console.error("Failed to fetch status", error);
        } finally {
          setLoadingStatus(false);
        }
      } else if (session === null) {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [session]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            TuitionEd
          </Typography>
        </Link>
      </Toolbar>
      <Divider />
      <List>
        {(teacherStatus === 'approved' ? navItems : []).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <ListItem key={item.text} disablePadding component={Link} href={item.href} sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemButton
                sx={{
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' },
                  m: 1,
                  borderRadius: 2,
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.7)' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List sx={{ marginTop: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => signOut({ callbackUrl: '/' })}
            sx={{
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' },
              m: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }}><LogOut size={20} /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <style jsx global>{`
        @media (max-width: 767px) {
          header.fixed.top-0 {
            display: none;
          }
        }
        @media (min-width: 600px) {
          footer.bg-black {
            margin-left: ${drawerWidth}px;
            width: calc(100% - ${drawerWidth}px);
          }
        }
      `}</style>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#111827', // Dark background
          color: 'white',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div">Teacher Portal</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>{userName}</Typography>
            <UserProfileMenu userType="teacher" />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          '& .MuiDrawer-paper': {
            bgcolor: '#111827', // Dark background
            color: 'white',
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#111827',
              color: 'white'
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#111827',
              color: 'white'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: '#030712', p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {loadingStatus ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'white' }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : teacherStatus === 'approved' ? (
          children
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '80vh', 
            color: 'white',
            textAlign: 'center',
            p: 3
          }}>
            <AlertCircle size={64} className={teacherStatus === 'rejected' ? "text-red-500 mb-4" : "text-yellow-500 mb-4"} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Account {teacherStatus === 'rejected' ? 'Rejected' : 'Pending Approval'}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, color: 'gray.400' }}>
              {teacherStatus === 'rejected' 
                ? "We're sorry, but your application to become a teacher has been rejected. Please contact support for more information."
                : "Your application is currently under review by our administrators. You will receive full access to the dashboard and courses once your account is approved."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
