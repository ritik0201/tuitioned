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
  Search
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

interface CourseFormValues {
  title: string;
  description: string;
  grade: string;
  teacherId: string;
  classTime: string;
  classDays: string[];
  noOfClasses: number | string;
  perClassPrice: number | string;
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
      noOfClasses: '',
      perClassPrice: '',
      noOfclassTeacher: '',
      teacherPerClassPrice: '',
      joinLink: '',
      classroomLink: '',
    },
  });

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

  const nextStep = () => {
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

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        noOfClasses: Number(data.noOfClasses),
        perClassPrice: Number(data.perClassPrice),
        noOfclassTeacher: Number(data.noOfclassTeacher),
        teacherPerClassPrice: Number(data.teacherPerClassPrice),
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
    <div className="flex flex-col h-full bg-[#0a0c10] text-gray-100 overflow-hidden">
      {/* progress */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-[#0d0f14] shrink-0">
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
                    isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-800 border-gray-700'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
                </div>
                <span className={`text-[8px] uppercase font-black tracking-tighter ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`absolute top-4 left-8 w-[calc(400px/4)] h-[1px] -z-10 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col grow h-full overflow-hidden">
          <div className="p-6 grow overflow-hidden flex flex-col items-stretch">
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
                      <h2 className="text-xl font-black text-white px-1">Course Identity</h2>
                    </div>
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Subject</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input placeholder="e.g. Physics Core" {...field} className="bg-gray-900 border-gray-800 h-12 pl-10 rounded-xl focus:border-blue-500 transition-all" />
                            <BookText className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-600 group-focus-within:text-blue-500" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Grade</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input placeholder="e.g. 12th Standard" {...field} className="bg-gray-900 border-gray-800 h-12 pl-10 rounded-xl focus:border-blue-500 transition-all" />
                            <GraduationCap className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-600 group-focus-within:text-blue-500" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-white px-1">Educator Assignment</h2>
                    </div>
                    <FormField control={form.control} name="teacherId" render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Faculty Member</FormLabel>
                        <div className="relative">
                          <div 
                            onClick={() => !isLoadingTeachers && setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            className={`
                              bg-gray-900 border-gray-800 h-14 pl-10 pr-10 rounded-xl border flex items-center cursor-pointer transition-all
                              ${isTeacherDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'hover:border-gray-700'}
                              ${isLoadingTeachers ? 'opacity-50 cursor-wait' : ''}
                            `}
                          >
                            <User className="absolute left-3 h-5 w-5 text-gray-600" />
                            <div className="flex flex-col">
                              <span className={selectedTeacher ? "text-gray-100 font-bold text-sm" : "text-gray-500 text-sm"}>
                                {isLoadingTeachers ? "Retrieving experts..." : (selectedTeacher ? selectedTeacher.name : "Choose educator")}
                              </span>
                              {selectedTeacher && (
                                <span className="text-[9px] text-gray-500 truncate max-w-[250px]">
                                  {selectedTeacher.listOfSubjects?.join(", ") || selectedTeacher.email}
                                </span>
                              )}
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                               <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isTeacherDropdownOpen ? 'rotate-90' : ''}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isTeacherDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 z-[999] mt-2 bg-[#121417] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                              >
                                <div className="p-3 border-b border-gray-800/50">
                                   <div className="relative">
                                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                                      <Input 
                                        placeholder="Search name or subject..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-950 border-gray-800 h-9 pl-9 text-xs rounded-lg focus:ring-1 focus:ring-blue-500"
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
                                        ${field.value === teacher.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}
                                      `}
                                    >
                                      <Avatar className="h-9 w-9 border border-white/5">
                                        <AvatarImage src={teacher.profileImage} />
                                        <AvatarFallback className="bg-blue-600 text-[10px] text-white font-bold">{teacher.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm ${field.value === teacher.id ? 'text-blue-400' : 'text-gray-200'}`}>{teacher.name}</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                           {teacher.listOfSubjects?.slice(0, 2).map((sub, i) => (
                                             <span key={i} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 uppercase font-black tracking-tighter">{sub}</span>
                                           ))}
                                           {(teacher.listOfSubjects?.length || 0) > 2 && (
                                             <span className="text-[8px] text-gray-600">+{(teacher.listOfSubjects?.length || 0) - 2}</span>
                                           )}
                                        </div>
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="py-10 text-center flex flex-col items-center gap-2">
                                       <Search size={24} className="text-gray-800" />
                                       <p className="text-xs text-gray-600 italic font-medium">No educators match your search</p>
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
                      <h2 className="text-xl font-black text-white px-1">Class Schedule</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="classTime" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Timing</FormLabel>
                          <FormControl>
                            <Input placeholder="05:00 PM" {...field} className="bg-gray-900 border-gray-800 h-12 rounded-xl" />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="noOfClasses" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Sessions</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-gray-900 border-gray-800 h-12 rounded-xl" />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <div className="space-y-2">
                       <FormLabel className="text-gray-500 text-[10px] font-bold uppercase ml-1">Weekly Cadence</FormLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {availableDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`flex-1 h-10 rounded-lg text-[9px] font-black uppercase border transition-all ${
                              selectedDays.includes(day)
                                ? "bg-blue-600 border-blue-400 text-white"
                                : "bg-gray-900 border-gray-800 text-gray-600"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-white px-1">Final Launch</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="perClassPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-emerald-500 text-[9px] font-black uppercase ml-1">Price / Class</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-gray-900 border-emerald-500/20 h-11 rounded-lg" />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="teacherPerClassPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-emerald-500 text-[9px] font-black uppercase ml-1">Expert Pay</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-gray-900 border-emerald-500/20 h-11 rounded-lg" />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="joinLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-500 text-[9px] font-black uppercase ml-1">G-Meet / Zoom Link</FormLabel>
                        <FormControl>
                          <Input placeholder="URL..." {...field} className="bg-gray-900 border-gray-800 h-10 rounded-lg text-xs" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="classroomLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-500 text-[9px] font-black uppercase ml-1">Classroom URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL..." {...field} className="bg-gray-900 border-gray-800 h-10 rounded-lg text-xs" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-4 bg-[#0d0f14] border-t border-gray-800/20 flex gap-3 shrink-0">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-10 px-5 border-gray-800 text-gray-500 hover:text-white rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="grow h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span className="uppercase tracking-widest text-[10px]">Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="grow h-10 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
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
