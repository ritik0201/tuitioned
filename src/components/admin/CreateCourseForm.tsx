"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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

interface CreateCourseFormProps {
  studentId: string;
  onCourseCreated: () => void; // Callback to close dialog or refresh data
}

export default function CreateCourseForm({ studentId, onCourseCreated }: CreateCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

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

  const toggleDay = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelectedDays);
    form.setValue('classDays', newSelectedDays, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
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

      // Handle non-JSON responses, which often indicate an auth redirect (HTML page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received an invalid response from the server. Your session may have expired.');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create course');
      }

      toast.success('Course created and assigned successfully.');
      onCourseCreated();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-4 gap-x-6 gap-y-4 backdrop-blur-3xl text-gray-300">
        {/* Course Title */}
        <div key="title" className="md:col-span-2">
          <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Mathematics" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Grade */}
        <div key="grade" className="md:col-span-2">
          <FormField control={form.control} name="grade" render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl><Input placeholder="e.g., 10th" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Teacher Name */}
        <div key="teacherId" className="md:col-span-2">
          <FormField control={form.control} name="teacherId" render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter Teacher ID"
                  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>)} />
        </div>

        {/* Class Time */}
        <div key="classTime" className="md:col-span-2">
          <FormField control={form.control} name="classTime" render={({ field }) => (<FormItem><FormLabel>Class Time</FormLabel><FormControl><Input placeholder="e.g., 5:00 PM - 6:00 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Description */}
        <div key="description" className="md:col-span-4">
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Course details..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Class Days */}
        <div key="classDays" className="md:col-span-4">
          <FormItem>
            <FormLabel>Class Days</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2 pt-2">
                {availableDays.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant="outline"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full ${
                      selectedDays.includes(day)
                        ? "!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700 hover:!text-white"
                        : ""
                    }`}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        {/* Number of Classes, Prices */}
        <div className="md:col-span-4 grid md:grid-cols-3 gap-x-6 gap-y-4">
          <div key="noOfClasses">
            <FormField control={form.control} name="noOfClasses" render={({ field }) => (<FormItem><FormLabel>Number of Classes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <div key="perClassPrice">
            <FormField control={form.control} name="perClassPrice" render={({ field }) => (<FormItem><FormLabel>Price per Class</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <div key="teacherPerClassPrice">
            <FormField control={form.control} name="teacherPerClassPrice" render={({ field }) => (<FormItem><FormLabel>Teacher's Price/Class</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
        </div>

        {/* Join & Classroom Links */}
        <div className="md:col-span-4 flex flex-col md:flex-row gap-x-6 gap-y-4">
          <div key="joinLink" className="flex-1">
            <FormField control={form.control} name="joinLink" render={({ field }) => (
              <FormItem>
                <FormLabel>Join Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., https://meet.google.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>)} />
          </div>
          <div key="classroomLink" className="flex-1">
            <FormField control={form.control} name="classroomLink" render={({ field }) => (
              <FormItem>
                <FormLabel>Classroom Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., https://classroom.google.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>)} />
          </div>
        </div>
        {/* Submit Button */}
        <div key="submit" className="md:col-span-4 pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          {isSubmitting ? (
            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating... </>
          ) : (
            'Create and Assign Course'
          )}
        </Button>
        </div>
      </form>
    </Form>
  );
}
