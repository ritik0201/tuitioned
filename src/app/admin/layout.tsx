"use client"

import React, { useMemo, useState } from 'react';
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
import { LayoutDashboard, Users, School, LogOut, Menu, Sparkles, Receipt, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
  { text: 'Students', icon: <Users size={20} />, href: '/admin/students' },
  { text: 'Approved Teachers', icon: <UserCheck size={20} />, href: '/admin/approved-teacher' },
  { text: 'Trial Classes', icon: <Sparkles size={20} />, href: '/admin/democlass-student' },
  { text: 'Teachers', icon: <School size={20} />, href: '/admin/teachers' },
  { text: 'Signup Students', icon: <Users size={20} />, href: '/admin/signup-student' },
  { text: 'Transactions', icon: <Receipt size={20} />, href: '/admin/transaction' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const { data: session } = useSession();

  const { userName, userInitial } = useMemo(() => {
    const name = session?.user?.name || 'Admin';
    return {
      userName: name,
      userInitial: name.charAt(0).toUpperCase(),
    };
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
        {navItems.map((item) => {
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
            <Typography variant="h6" noWrap component="div">Admin Panel</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>{userName}</Typography>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{userInitial}</Avatar>
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
        {children}
      </Box>
    </Box>
  );
}