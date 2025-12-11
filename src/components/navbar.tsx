'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    Button,
    Avatar,
    Menu as MuiMenu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import TeacherAuthModal from './TeacherAuthModal';
import TeacherSignInModal from './TeacherSignInModal';
import TeacherSignUpModal from './TeacherSignUpModal';
import { useUI } from '@/provider/UIProvider';

const Logo = () => (
    <Link href="/" className="font-bold text-xl tracking-tight text-foreground">
        Tuition-ed
    </Link>
);

const navLinks = [
    { href: 'https://tuition-ed.com/k-12-school-time-courses/', label: 'Courses' },
    { href: 'https://tuition-ed.com/about-us/', label: 'About' },
    { href: 'https://tuition-ed.com/blog/', label: 'Blog' },
    { href: 'https://tuition-ed.com/contact-us/', label: 'Contact' },
];

const Navbar = () => {
    const { data: session, status } = useSession();
    const { activeModal, openModal, closeModal, switchModal } = useUI();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isClient, setIsClient] = useState(false);
    const isUserMenuOpen = Boolean(anchorEl);

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserMenuClose();
        signOut({ callbackUrl: '/' });
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getInitials = (name: string = "") => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                    <Logo />
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (<Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors" > {link.label} </Link>))}
                    </div>
                </div>
                {/* Desktop right side */}
                <div className="hidden md:flex items-center gap-2">
                    {status === 'authenticated' ? (
                        <>
                            <Button
                                onClick={handleUserMenuOpen}
                                sx={{ borderRadius: '9999px', p: 0.5, minWidth: 0 }}
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                    {getInitials(session.user?.fullName)}
                                </Avatar>
                            </Button>
                            <MuiMenu
                                anchorEl={anchorEl}
                                open={isUserMenuOpen}
                                onClose={handleUserMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{ sx: { mt: 1.5, bgcolor: '#1f2937', color: 'white', borderRadius: 2 } }}
                            >
                                <MenuItem component={Link} href="/dashboard" onClick={handleUserMenuClose}>
                                    <ListItemIcon><LayoutDashboard size={20} className="text-white/70" /></ListItemIcon>
                                    <ListItemText>Dashboard</ListItemText>
                                </MenuItem>
                                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon><LogOut size={20} className="text-white/70" /></ListItemIcon>
                                    <ListItemText>Logout</ListItemText>
                                </MenuItem>
                            </MuiMenu>
                        </>
                    ) : (<>
                        <Button
                            variant="text"
                            onClick={() => openModal('teacherAuth')}
                            sx={{
                                color: 'inherit',
                                '&:hover': { backgroundColor: 'action.hover' }
                            }}
                        >
                            Become a Teacher
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={() => openModal('login')} 
                            sx={{
                                height: '40px',
                                backgroundColor: '#fff',
                                color: '#000',
                                '&:hover': { backgroundColor: '#f0f0f0' }
                            }}>
                                Login
                        </Button></>)}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                    </button>
                </div>
            </nav>
            {/* Mobile Menu Dropdown */}
            {isClient && (
                <div
                    className={`md:hidden absolute top-full left-0 w-full bg-background/80 backdrop-blur-lg border-b shadow-lg transition-all duration-300 ease-in-out
              ${isMobileMenuOpen
                            ? 'opacity-100 translate-y-0 visible'
                            : 'opacity-0 -translate-y-4 invisible'
                        }`}
                >
                    <div className="px-4 pt-2 pb-4 space-y-4">

                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        {status === 'authenticated' ? (
                            <Button
                                component={Link}
                                href="/dashboard"
                                variant="outlined"
                                onClick={() => setIsMobileMenuOpen(false)}
                                fullWidth
                                sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.23)' }}
                            >
                                Dashboard
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => { openModal('teacherAuth'); setIsMobileMenuOpen(false); }}
                                fullWidth
                                sx={{
                                    color: 'text.primary',
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                }}
                            >
                                Become a Teacher
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        {status === 'authenticated' ? (
                            <Button
                                variant="contained"
                                onClick={() => { signOut({ callbackUrl: '/' }); setIsMobileMenuOpen(false); }}
                                fullWidth sx={{
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => { openModal('login'); setIsMobileMenuOpen(false); }}
                                fullWidth sx={{
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                            >
                                Login / Sign Up
                            </Button>
                        )}
                    </div>
                    </div>
                </div>
            )}
            <LoginModal open={activeModal === 'login'} onClose={closeModal} onSwitchToSignUp={() => switchModal('signup')} />
            <SignUpModal open={activeModal === 'signup'} onClose={closeModal} />
            <TeacherAuthModal open={activeModal === 'teacherAuth'} onClose={closeModal} />
            <TeacherSignInModal open={activeModal === 'teacherSignin'} onClose={closeModal} />
            <TeacherSignUpModal open={activeModal === 'teacherSignup'} onClose={closeModal} />
        </header>
    );
};

export default Navbar;