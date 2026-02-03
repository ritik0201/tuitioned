'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Wait until session is loaded

    if (status === 'unauthenticated') {
      router.replace('/'); // Not logged in, send to home
      return;
    }

    const userRole = session?.user?.role;

    if (userRole === 'admin') {
      router.replace('/admin/dashboard');
    } else if (userRole === 'teacher') {
      router.replace('/teacher/dashboard');
    } else if (userRole === 'student') {
      router.replace('/student/dashboard');
    } else {
      // Fallback for unknown roles or if role is not set
      router.replace('/');
    }
  }, [session, status, router]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Skeleton variant="circular" width={48} height={48} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    </Container>
  );
}
