"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { 
  Loader2, 
  BookText, 
  GraduationCap, 
  User, 
  Clock, 
  CalendarDays, 
  Hash, 
  IndianRupee, 
  Link as LinkIcon, 
  Video,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Rocket,
  Search,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '@/lib/currency';

export interface ScheduleItem {
  studentSchedule: string;
  teacherSchedule: string;
  studentDay?: string;
  studentTime?: string;
  teacherDay?: string;
  teacherTime?: string;
  isCustomStudentTime?: boolean;
  isCustomTeacherTime?: boolean;
}

const DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_OPTIONS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
];

interface CourseFormValues {
  title: string;
  description: string;
  grade: string;
  teacherId: string;
  classTime: string;
  classDays: string[];
  noOfClasses: number | string;
  perClassPrice: number | string;
  currency: string;
  noOfclassTeacher?: number | string;
  teacherPerClassPrice?: number | string;
  joinLink?: string;
  classroomLink?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  listOfSubjects?: string[];
  profileImage?: string;
}

interface CreateCourseFormProps {
  studentId: string;
  onCourseCreated: () => void;
}

const STEPS = [
  { id: 'details', title: 'Details', icon: BookText },
  { id: 'teacher', title: 'Faculty', icon: User },
  { id: 'schedule', title: 'Timing', icon: Clock },
  { id: 'launch', title: 'Launch', icon: Rocket },
];

export default function CreateCourseForm({ studentId, onCourseCreated }: CreateCourseFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      studentDay: '',
      studentTime: '',
      studentSchedule: '',
      teacherDay: '',
      teacherTime: '',
      teacherSchedule: '',
    }
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  const form = useForm<CourseFormValues>({
    defaultValues: {
      title: '',
      description: '',
      grade: '',
      teacherId: '',
      classTime: '',
      classDays: [],
      noOfClasses: '0',
      perClassPrice: '',
      currency: 'INR',
      noOfclassTeacher: '',
      teacherPerClassPrice: '',
      joinLink: '',
      classroomLink: '',
    },
  });

  const selectedCurrency = form.watch('currency') || 'INR';
  const currentCurrencySymbol = getCurrencySymbol(selectedCurrency);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await fetch('/api/teachers?status=approved');
        if (response.ok) {
          const data = await response.json();
          setTeachers(data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const teacherIdWatch = form.watch('teacherId');
  const selectedTeacher = teachers.find(t => t.id === teacherIdWatch);

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.listOfSubjects?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (teacherIdWatch && teacherIdWatch.length === 24) {
      fetch(`/api/teachers/${teacherIdWatch}`)
        .then(res => res.json())
        .then(data => {
          if (data?.teacher?.joinLink) {
            form.setValue('joinLink', data.teacher.joinLink, { shouldValidate: true });
          }
        })
        .catch(err => console.error('Failed to fetch teacher details:', err));
    }
  }, [teacherIdWatch, form]);

  const toggleDay = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelectedDays);
    form.setValue('classDays', newSelectedDays, { shouldValidate: true });
  };

  const formatSlotSchedule = (time?: string, day?: string) => {
    const t = (time || '').trim();
    const d = (day || '').trim();
    if (t && d) return `${t} - ${d}`;
    return t || d || '';
  };

  const handleStudentDayChange = (index: number, day: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const newTime = current.studentTime || '';
      updated[index] = {
        ...current,
        studentDay: day,
        studentSchedule: formatSlotSchedule(newTime, day),
      };
      return updated;
    });
  };

  const handleStudentTimeChange = (index: number, timeValue: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (timeValue === 'custom') {
        updated[index] = {
          ...current,
          isCustomStudentTime: true,
          studentTime: current.studentTime || '',
          studentSchedule: formatSlotSchedule(current.studentTime, current.studentDay),
        };
      } else {
        updated[index] = {
          ...current,
          isCustomStudentTime: false,
          studentTime: timeValue,
          studentSchedule: formatSlotSchedule(timeValue, current.studentDay),
        };
      }
      return updated;
    });
  };

  const handleCustomStudentTimeInput = (index: number, customVal: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      updated[index] = {
        ...current,
        studentTime: customVal,
        studentSchedule: formatSlotSchedule(customVal, current.studentDay),
      };
      return updated;
    });
  };

  const handleTeacherDayChange = (index: number, day: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const newTime = current.teacherTime || '';
      updated[index] = {
        ...current,
        teacherDay: day,
        teacherSchedule: formatSlotSchedule(newTime, day),
      };
      return updated;
    });
  };

  const handleTeacherTimeChange = (index: number, timeValue: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (timeValue === 'custom') {
        updated[index] = {
          ...current,
          isCustomTeacherTime: true,
          teacherTime: current.teacherTime || '',
          teacherSchedule: formatSlotSchedule(current.teacherTime, current.teacherDay),
        };
      } else {
        updated[index] = {
          ...current,
          isCustomTeacherTime: false,
          teacherTime: timeValue,
          teacherSchedule: formatSlotSchedule(timeValue, current.teacherDay),
        };
      }
      return updated;
    });
  };

  const handleCustomTeacherTimeInput = (index: number, customVal: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      updated[index] = {
        ...current,
        teacherTime: customVal,
        teacherSchedule: formatSlotSchedule(customVal, current.teacherDay),
      };
      return updated;
    });
  };

  const copyStudentScheduleToTeacher = (index: number) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const current = updated[index];
      updated[index] = {
        ...current,
        teacherDay: current.studentDay || '',
        teacherTime: current.studentTime || '',
        isCustomTeacherTime: current.isCustomStudentTime,
        teacherSchedule: formatSlotSchedule(current.studentTime, current.studentDay),
      };
      return updated;
    });
    toast.success('Copied student timing to teacher schedule');
  };

  const addSchedule = () => {
    setSchedules((prev) => {
      const next = [
        ...prev,
        {
          studentDay: '',
          studentTime: '',
          studentSchedule: '',
          teacherDay: '',
          teacherTime: '',
          teacherSchedule: '',
        },
      ];
      const currentSessions = form.getValues('noOfClasses');
      if (Number(currentSessions) === prev.length && prev.length > 0) {
        form.setValue('noOfClasses', next.length, { shouldValidate: true });
      }
      return next;
    });
  };

  const removeSchedule = (index: number) => {
    setSchedules((prev) => {
      if (prev.length <= 1) {
        return [
          {
            studentDay: '',
            studentTime: '',
            studentSchedule: '',
            teacherDay: '',
            teacherTime: '',
            teacherSchedule: '',
          },
        ];
      }
      const next = prev.filter((_, i) => i !== index);
      const currentSessions = form.getValues('noOfClasses');
      if (Number(currentSessions) === prev.length && prev.length > 1) {
        form.setValue('noOfClasses', next.length, { shouldValidate: true });
      }
      return next;
    });
  };

  const nextStep = () => {
    if (currentStep === 0) {
      const title = form.getValues('title');
      const grade = form.getValues('grade');
      if (!title?.trim()) {
        toast.error('Please enter the subject/course title.');
        return;
      }
      if (!grade?.trim()) {
        toast.error('Please enter the grade level.');
        return;
      }
    } else if (currentStep === 1) {
      const teacherId = form.getValues('teacherId');
      if (!teacherId) {
        toast.error('Please select an educator.');
        return;
      }
    } else if (currentStep === 2) {
      const noOfClasses = form.getValues('noOfClasses');
      if (noOfClasses === '' || noOfClasses === undefined || noOfClasses === null || isNaN(Number(noOfClasses)) || Number(noOfClasses) < 0) {
        toast.error('Please specify the number of sessions (0 or more).');
        return;
      }
      const hasValidSchedule = schedules.some(
        s => (s.studentDay && s.studentTime) || (s.teacherDay && s.teacherTime) || s.studentSchedule.trim() || s.teacherSchedule.trim()
      );
      if (!hasValidSchedule) {
        toast.error('Please select Day and Time for at least one schedule.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    // This should only be reachable from the "Launch Course" button on Step 3
    if (currentStep !== STEPS.length - 1) {
      return;
    }

    // Final validation - only runs on the very last step
    if (!data.perClassPrice || !data.joinLink) {
      toast.message("Please fill the Price and Meeting Link.");
      return;
    }

    const validSchedules = schedules
      .map(s => {
        const studentSchedule = s.studentSchedule?.trim() || formatSlotSchedule(s.studentTime, s.studentDay);
        const teacherSchedule = s.teacherSchedule?.trim() || formatSlotSchedule(s.teacherTime, s.teacherDay);
        return {
          studentDay: s.studentDay || '',
          studentTime: s.studentTime || '',
          studentSchedule,
          teacherDay: s.teacherDay || '',
          teacherTime: s.teacherTime || '',
          teacherSchedule,
        };
      })
      .filter(s => s.studentSchedule || s.teacherSchedule || (s.studentDay && s.studentTime) || (s.teacherDay && s.teacherTime));

    const studentTimeSummary = validSchedules
      .map(s => s.studentSchedule)
      .filter(Boolean)
      .join(', ');

    const teacherTimeSummary = validSchedules
      .map(s => s.teacherSchedule)
      .filter(Boolean)
      .join(', ');

    const extractedDays = Array.from(new Set(
      validSchedules.map(s => s.studentDay || s.teacherDay).filter(Boolean) as string[]
    ));

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        schedules: validSchedules,
        classTime: studentTimeSummary,
        teacherClassTime: teacherTimeSummary,
        classDays: extractedDays.length > 0 ? extractedDays : selectedDays,
        noOfClasses: isNaN(Number(data.noOfClasses)) ? 0 : Number(data.noOfClasses),
        perClassPrice: Number(data.perClassPrice),
        currency: (data.currency || 'INR').toUpperCase(),
        noOfclassTeacher: isNaN(Number(data.noOfclassTeacher)) ? (isNaN(Number(data.noOfClasses)) ? 0 : Number(data.noOfClasses)) : Number(data.noOfclassTeacher),
        teacherPerClassPrice: Number(data.teacherPerClassPrice || 0),
      };

      const response = await fetch(`/api/students/${studentId}/my-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response error.');
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create course');

      toast.success('Course launched successfully!');
      onCourseCreated();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* progress */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 shrink-0">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 border
                  ${isActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 
                    isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />}
                </div>
                <span className={`text-[8px] uppercase font-black tracking-tighter ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`absolute top-4 left-8 w-[calc(400px/4)] h-[1px] -z-10 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col grow h-full overflow-hidden">
          <div className="p-6 md:p-8 grow overflow-y-auto flex flex-col items-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white px-1">Course Identity</h2>
                    </div>
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1">Subject</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input placeholder="e.g. Physics Core" {...field} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-12 pl-10 rounded-xl focus:border-blue-500 transition-all font-medium text-sm" />
                            <BookText className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1">Grade</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input placeholder="e.g. 12th Standard" {...field} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-12 pl-10 rounded-xl focus:border-blue-500 transition-all font-medium text-sm" />
                            <GraduationCap className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white px-1">Educator Assignment</h2>
                    </div>
                    <FormField control={form.control} name="teacherId" render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1">Faculty Member</FormLabel>
                        <div className="relative">
                          <div 
                            onClick={() => !isLoadingTeachers && setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            className={`
                              bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-14 pl-10 pr-10 rounded-xl border flex items-center cursor-pointer transition-all
                              ${isTeacherDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'hover:border-slate-300 dark:hover:border-slate-700'}
                              ${isLoadingTeachers ? 'opacity-50 cursor-wait' : ''}
                            `}
                          >
                            <User className="absolute left-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <div className="flex flex-col">
                              <span className={selectedTeacher ? "text-slate-900 dark:text-slate-100 font-bold text-sm" : "text-slate-400 dark:text-slate-500 text-sm"}>
                                {isLoadingTeachers ? "Retrieving experts..." : (selectedTeacher ? selectedTeacher.name : "Choose educator")}
                              </span>
                              {selectedTeacher && (
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[250px]">
                                  {selectedTeacher.listOfSubjects?.join(", ") || selectedTeacher.email}
                                </span>
                              )}
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                               <ChevronRight className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isTeacherDropdownOpen ? 'rotate-90' : ''}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isTeacherDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 z-[999] mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                              >
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                   <div className="relative">
                                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                      <Input 
                                        placeholder="Search name or subject..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-9 pl-9 text-xs rounded-lg focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                   </div>
                                </div>
                                <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-hide">
                                  {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                                    <div 
                                      key={teacher.id} 
                                      onClick={() => {
                                        field.onChange(teacher.id);
                                        setIsTeacherDropdownOpen(false);
                                        setSearchTerm('');
                                      }}
                                      className={`
                                        flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-colors mb-0.5 last:mb-0
                                        ${field.value === teacher.id ? 'bg-blue-50 dark:bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}
                                      `}
                                    >
                                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage src={teacher.profileImage} />
                                        <AvatarFallback className="bg-blue-600 text-[10px] text-white font-bold">{teacher.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm ${field.value === teacher.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{teacher.name}</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                           {teacher.listOfSubjects?.slice(0, 2).map((sub, i) => (
                                             <span key={i} className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase font-black tracking-tighter">{sub}</span>
                                           ))}
                                           {(teacher.listOfSubjects?.length || 0) > 2 && (
                                             <span className="text-[8px] text-slate-400 dark:text-slate-500">+{(teacher.listOfSubjects?.length || 0) - 2}</span>
                                           )}
                                        </div>
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="py-10 text-center flex flex-col items-center gap-2">
                                       <Search size={24} className="text-slate-300 dark:text-slate-700" />
                                       <p className="text-xs text-slate-400 dark:text-slate-500 italic font-medium">No educators match your search</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white px-1">Class Schedule</h2>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {schedules.length} {schedules.length === 1 ? 'Slot' : 'Slots'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                        Configure different timings and days for student &amp; teacher per class.
                      </p>
                    </div>

                    {/* Sessions Field */}
                    <FormField control={form.control} name="noOfClasses" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1 flex items-center justify-between">
                          <span>Total Sessions / Classes</span>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Can be 0 (student adds sessions via payment)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="0 (or enter number of sessions)" 
                              {...field} 
                              className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-11 pl-10 rounded-xl text-sm font-medium focus:border-blue-500 transition-all" 
                            />
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Schedules Section */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                          Class Timings
                        </span>
                        <button
                          type="button"
                          onClick={addSchedule}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Schedule</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {schedules.map((schedule, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  Class #{idx + 1}
                                </span>
                                {schedule.studentSchedule && (
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/60">
                                    {schedule.studentSchedule}
                                  </span>
                                )}
                              </div>
                              {schedules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSchedule(idx)}
                                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                  title="Remove this class slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Student Slot */}
                              <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
                                    Time for student - day
                                  </label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Day</label>
                                    <select
                                      value={schedule.studentDay || ''}
                                      onChange={(e) => handleStudentDayChange(idx, e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-9 px-2 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                                    >
                                      <option value="">Select Day</option>
                                      {DAY_OPTIONS.map((day) => (
                                        <option key={day} value={day} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                          {day}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Time</label>
                                    <select
                                      value={schedule.isCustomStudentTime ? 'custom' : (schedule.studentTime || '')}
                                      onChange={(e) => handleStudentTimeChange(idx, e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-9 px-2 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                                    >
                                      <option value="">Select Time</option>
                                      {TIME_OPTIONS.map((time) => (
                                        <option key={time} value={time} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                          {time}
                                        </option>
                                      ))}
                                      <option value="custom" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Custom Time...</option>
                                    </select>
                                  </div>
                                </div>
                                {schedule.isCustomStudentTime && (
                                  <div className="pt-1">
                                    <Input
                                      type="text"
                                      placeholder="Enter custom time (e.g. 05:15 PM)"
                                      value={schedule.studentTime || ''}
                                      onChange={(e) => handleCustomStudentTimeInput(idx, e.target.value)}
                                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-8 text-xs rounded-lg"
                                      autoFocus
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Teacher Slot */}
                              <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-emerald-500" />
                                    Time for teacher - day
                                  </label>
                                  {(schedule.studentDay || schedule.studentTime) && (
                                    <button
                                      type="button"
                                      onClick={() => copyStudentScheduleToTeacher(idx)}
                                      className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                                      title="Copy student timing to teacher"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>Same as student</span>
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Day</label>
                                    <select
                                      value={schedule.teacherDay || ''}
                                      onChange={(e) => handleTeacherDayChange(idx, e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-9 px-2 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                                    >
                                      <option value="">Select Day</option>
                                      {DAY_OPTIONS.map((day) => (
                                        <option key={day} value={day} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                          {day}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Time</label>
                                    <select
                                      value={schedule.isCustomTeacherTime ? 'custom' : (schedule.teacherTime || '')}
                                      onChange={(e) => handleTeacherTimeChange(idx, e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-9 px-2 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                                    >
                                      <option value="">Select Time</option>
                                      {TIME_OPTIONS.map((time) => (
                                        <option key={time} value={time} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                          {time}
                                        </option>
                                      ))}
                                      <option value="custom" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Custom Time...</option>
                                    </select>
                                  </div>
                                </div>
                                {schedule.isCustomTeacherTime && (
                                  <div className="pt-1">
                                    <Input
                                      type="text"
                                      placeholder="Enter custom time (e.g. 06:15 AM)"
                                      value={schedule.teacherTime || ''}
                                      onChange={(e) => handleCustomTeacherTimeInput(idx, e.target.value)}
                                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-8 text-xs rounded-lg"
                                      autoFocus
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addSchedule}
                        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-400/50 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Schedule</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white px-1">Final Launch</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase ml-1">Currency</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || 'INR'}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-11 rounded-lg text-xs font-bold px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {SUPPORTED_CURRENCIES.map((curr) => (
                                <option key={curr.code} value={curr.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                  {curr.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="perClassPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase ml-1">
                            Price / Class ({currentCurrencySymbol})
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                                {currentCurrencySymbol}
                              </span>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="e.g. 500" 
                                {...field} 
                                className="bg-slate-100 dark:bg-slate-900 border-emerald-500/30 text-slate-900 dark:text-slate-100 h-11 pl-8 rounded-lg text-sm font-bold" 
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="teacherPerClassPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase ml-1">
                            Expert Pay (₹)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                                ₹
                              </span>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="e.g. 300" 
                                {...field} 
                                className="bg-slate-100 dark:bg-slate-900 border-emerald-500/30 text-slate-900 dark:text-slate-100 h-11 pl-8 rounded-lg text-sm font-bold" 
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="joinLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase ml-1">G-Meet / Zoom Link</FormLabel>
                        <FormControl>
                          <Input placeholder="URL..." {...field} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-10 rounded-lg text-xs" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="classroomLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase ml-1">Classroom URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL..." {...field} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-10 rounded-lg text-xs" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-10 px-5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="grow h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="uppercase tracking-widest text-[10px]">Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="grow h-10 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span className="uppercase tracking-widest text-[10px]">Launch Course</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
