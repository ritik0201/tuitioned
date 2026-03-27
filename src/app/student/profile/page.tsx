"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Edit, 
  Save, 
  X,
  Sparkles,
  Rocket,
  Shield,
  Clock,
  Layout,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileData {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string | null;
  address: {
    street: string;
    city: string;
    state: string;
  };
  grade: string;
  fatherName: string;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="h-40 w-full bg-slate-900 border-4 border-slate-800 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[500px] w-full bg-slate-900 border-4 border-slate-800 rounded-[2.5rem]" />
        <div className="h-[500px] w-full bg-slate-900 border-4 border-slate-800 rounded-[2.5rem]" />
      </div>
    </div>
  );
}

const NeonInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  disabled, 
  type = "text", 
  icon: Icon 
}: { 
  label: string; 
  name: string; 
  value: string | null; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean; 
  type?: string; 
  icon?: any;
}) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-14 bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-900/50 disabled:cursor-not-allowed transition-all font-bold"
      />
    </div>
  </div>
);

const StudentProfilePage = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/student-profile');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch profile.');
        }
        if (data.profile.dateOfBirth) {
          data.profile.dateOfBirth = new Date(data.profile.dateOfBirth).toISOString().split('T')[0];
        }
        setProfile(data.profile);
        setInitialProfile(data.profile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!profile) return;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: { ...(profile[parent as keyof ProfileData] as object), [child]: value },
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/student-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          mobile: profile.mobile,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address,
          grade: profile.grade,
          fatherName: profile.fatherName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save profile.');
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setInitialProfile(profile);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 p-8"><ProfileSkeleton /></div>;

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto border-2 border-red-500/30 bg-red-500/5">
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 selection:bg-indigo-500/30">
      {/* Profile Header Card */}
      <div className="relative group overflow-hidden bg-slate-900 border-4 border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 rounded-[2.5rem] p-1 shadow-2xl">
              <div className="w-full h-full bg-slate-950 rounded-[2.2rem] flex items-center justify-center">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-t from-indigo-400 to-cyan-400">
                  {profile.fullName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 bg-slate-950 border-4 border-slate-900 rounded-2xl shadow-xl">
               <ShieldCheck className="h-6 w-6 text-green-400" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-100">
                {profile.fullName}
              </h1>
              <p className="text-slate-400 font-bold tracking-wide italic flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Elite Cadet • Grade {profile.grade}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                Student Portal V2
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                Academic Verified
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-[0_6px_0_rgba(67,56,202,1)] hover:shadow-[0_3px_0_rgba(67,56,202,1)] hover:translate-y-[3px] transition-all border-2 border-indigo-400 flex items-center gap-3 text-lg"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  disabled={isSaving}
                  onClick={handleCancel}
                  variant="ghost"
                  className="h-16 px-8 rounded-2xl bg-slate-950/50 border-2 border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-black transition-all flex items-center gap-3 text-lg"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </Button>
                <Button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="h-16 px-8 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black shadow-[0_6px_0_rgba(16,185,129,1)] hover:shadow-[0_3px_0_rgba(16,185,129,1)] hover:translate-y-[3px] transition-all border-2 border-emerald-400 flex items-center gap-3 text-lg"
                >
                  {isSaving ? <Sparkles className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {isSaving ? "Saving..." : "Save Identity"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Basic Information Card */}
        <div className="bg-slate-900 border-4 border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full -mb-32 -ml-32 blur-3xl"></div>
          <div className="relative z-10 space-y-8">
            <h3 className="text-2xl font-black italic tracking-tight text-cyan-400 flex items-center gap-3">
              <User className="h-6 w-6" />
              Identity Protocol
            </h3>
            
            <div className="space-y-6">
              <NeonInput 
                label="Full Name" 
                name="fullName" 
                value={profile.fullName} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
                icon={User}
              />
              <NeonInput 
                label="Email Access (Read Only)" 
                name="email" 
                value={profile.email} 
                onChange={handleInputChange} 
                disabled={true} 
                icon={Mail}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <NeonInput 
                  label="Contact Frequency" 
                  name="mobile" 
                  value={profile.mobile} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  icon={Phone}
                />
                <NeonInput 
                  label="Launch Date (DOB)" 
                  name="dateOfBirth" 
                  value={profile.dateOfBirth} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  type="date"
                  icon={CalendarIcon}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Academic Profile */}
          <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full -mt-24 -mr-24 blur-2xl"></div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-black italic tracking-tight text-purple-400 flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                Academic Registry
              </h3>
              
              <div className="space-y-6">
                <NeonInput 
                  label="Grade Tier" 
                  name="grade" 
                  value={profile.grade} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  icon={Shield}
                />
                <NeonInput 
                  label="Guardian Support (Father's Name)" 
                  name="fatherName" 
                  value={profile.fatherName} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  icon={Layout}
                />
              </div>
            </div>
          </div>

          {/* Residence Protocol */}
          <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-500/5 rounded-full -mb-24 -mr-24 blur-2xl"></div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-black italic tracking-tight text-emerald-400 flex items-center gap-3">
                <MapPin className="h-6 w-6" />
                Residence Protocol
              </h3>
              
              <div className="space-y-6">
                <NeonInput 
                  label="Sector (Street)" 
                  name="address.street" 
                  value={profile.address.street} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  icon={Target}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <NeonInput 
                    label="Station (City)" 
                    name="address.city" 
                    value={profile.address.city} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    icon={MapPin}
                  />
                  <NeonInput 
                    label="Zone (State)" 
                    name="address.state" 
                    value={profile.address.state} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    icon={Shield}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
