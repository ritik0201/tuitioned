"use client";

import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] p-4">
      <Card className="w-full max-w-md border-red-500/50 bg-gray-900 text-white shadow-2xl">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <div className="rounded-full bg-red-500/10 p-3">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-500">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-4">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-200">Unauthorized Access</p>
            <p className="text-sm text-gray-400">
              You do not have the necessary permissions to view this current page. Please contact your administrator if you believe this is an error.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/')} 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}