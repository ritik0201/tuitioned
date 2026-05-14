"use client";

import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Home, ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white shadow-2xl rounded-[2rem] overflow-hidden border-2">
          <CardHeader className="flex flex-col items-center space-y-4 pt-10 pb-2 border-none">
            <div className="rounded-2xl bg-indigo-500/10 p-4 border border-indigo-500/20">
              <Lock className="h-10 w-10 text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white italic">Hold On!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8 p-8 pt-4">
            <div className="space-y-3">
              <p className="text-xl font-bold text-slate-200">Restricted Area</p>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                It looks like you don't have the permissions required to access this page. 
                This might happen if you're not logged in or using a different account type.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/')} 
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_4px_0_rgba(67,56,202,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all border-2 border-indigo-400"
                size="lg"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => router.back()} 
                className="w-full h-12 text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-xl transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}