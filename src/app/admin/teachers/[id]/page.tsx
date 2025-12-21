"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import {
  Mail,
  Phone,
  Book,
  Briefcase,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { ICourse } from "@/models/Course";
import Link from "next/link";

export type TeacherFromAPI = {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  qualification?: string;
  experience?: string;
  listOfSubjects?: string[];
};

interface ApiResponse {
  teacher: TeacherFromAPI;
  courses: ICourse[];
}

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const { id } = React.use(params); // Unwrap the params Promise
  const [teacher, setTeacher] = useState<TeacherFromAPI | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTeacherDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teachers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher details");
        }
        const data: ApiResponse = await response.json();
        setTeacher(data.teacher);
        setCourses(data.courses);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert severity="warning">No teacher data found.</Alert>;
  }

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight="medium">{value || 'N/A'}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Left Column - Teacher Details */}
        <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937', height: '100%' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.fullName}`}
                sx={{ width: 80, height: 80, fontSize: '2.5rem' }}
              >
                {teacher.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">{teacher.fullName}</Typography>
                <Typography variant="body1" color="text.secondary">{teacher.listOfSubjects?.join(", ") || "No subjects"}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <InfoItem icon={<Mail size={20} />} label="Email" value={teacher.email} />
            <InfoItem icon={<Book size={20} />} label="Subject" value={teacher.listOfSubjects?.join(", ")} />
            <InfoItem icon={<Phone size={20} />} label="Mobile" value={teacher.mobile} />
            <InfoItem icon={<GraduationCap size={20} />} label="Qualification" value={teacher.qualification} />
            <InfoItem icon={<Briefcase size={20} />} label="Experience" value={teacher.experience} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={1}>Subjects</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {teacher.listOfSubjects && teacher.listOfSubjects.length > 0 ? (
                teacher.listOfSubjects.map(subject => (
                  <Chip key={subject} label={subject} variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No subjects listed.</Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Assigned Courses */}
        <Box sx={{ flex: '2 1 600px' }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937' }}
          >
            <Typography variant="h5" fontWeight="bold">Assigned Courses</Typography>
            <Divider sx={{ my: 2 }} />
            {courses.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {courses.map((course) => (
                  <Paper
                    key={course._id.toString()}
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 3, bgcolor: '#374151', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" fontWeight="bold">{course.title}</Typography>
                        <Chip
                          label={course.noOfClasses > 0 ? "Running" : "Pending"}
                          size="small"
                          color={course.noOfClasses > 0 ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Student: {(course.studentId as any)?.fullName || 'N/A'}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2">
                        <span className="font-semibold">Classes Left:</span> {course.noOfClasses}
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href={`/admin/teachers/${id}/${course._id.toString()}`}
                      variant="outlined"
                      color="secondary"
                      endIcon={<ArrowRight size={16} />}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      View Details
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'info.main' }}>
                This teacher has not been assigned to any courses yet.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
