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
  ArrowLeft,
  FileText,
  Video,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { ICourse } from "@/models/Course";
import Link from "next/link";
import EditTeacherModal from "@/components/admin/EditTeacherModal";

export type TeacherFromAPI = {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string | Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  qualification?: string;
  experience?: string;
  experiance?: string;
  listOfSubjects?: string[];
  joinLink?: string;
  cvUrl?: string;
  aboutTeacher?: string;
  teacherStatus?: "pending" | "approved" | "rejected";
  profileImage?: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Check if URL has ?edit=true parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("edit") === "true") {
        setIsEditModalOpen(true);
      }
    }
  }, []);

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

  const InfoItem = ({
    icon,
    label,
    value,
    action,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    action?: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: "primary.main" }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="text.primary">
            {value || "N/A"}
          </Typography>
        </Box>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );

  const formattedAddress = [
    teacher.address?.street,
    teacher.address?.city,
    teacher.address?.state,
    teacher.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const formattedDob = teacher.dateOfBirth
    ? new Date(teacher.dateOfBirth).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Top Navigation & Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          component={Link}
          href="/admin/teachers"
          startIcon={<ArrowLeft size={18} />}
          sx={{
            color: "text.secondary",
            "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            px: 2.5,
            height: 40,
          }}
        >
          Back to Teachers
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsEditModalOpen(true)}
          startIcon={<Pencil size={16} />}
          sx={{
            height: 40,
            px: 3,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(79, 70, 229, 0.35)",
            },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Left Column - Teacher Details */}
        <Box sx={{ flex: "1 1 420px", minWidth: 320 }}>
          <Paper
            elevation={0}
            className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
            sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 5, bgcolor: "background.paper", height: "100%" }}
          >
            {/* Header with Avatar and Teacher Details */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <Avatar
                src={
                  teacher.profileImage ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.fullName}`
                }
                sx={{
                  width: 72,
                  height: 72,
                  fontSize: "2rem",
                  bgcolor: "primary.main",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                  flexShrink: 0,
                }}
              >
                {teacher.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {teacher.fullName}
                  </Typography>
                  {/* Status Badge */}
                  {teacher.teacherStatus === "approved" && (
                    <Chip
                      icon={<ShieldCheck size={14} />}
                      label="Approved"
                      size="small"
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.12)",
                        color: "#10b981",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        "& .MuiChip-icon": { color: "#10b981" },
                      }}
                    />
                  )}
                  {teacher.teacherStatus === "rejected" && (
                    <Chip
                      icon={<ShieldAlert size={14} />}
                      label="Rejected"
                      size="small"
                      sx={{
                        bgcolor: "rgba(244, 63, 94, 0.12)",
                        color: "#f43f5e",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(244, 63, 94, 0.25)",
                        "& .MuiChip-icon": { color: "#f43f5e" },
                      }}
                    />
                  )}
                  {(!teacher.teacherStatus || teacher.teacherStatus === "pending") && (
                    <Chip
                      icon={<Clock size={14} />}
                      label="Pending"
                      size="small"
                      sx={{
                        bgcolor: "rgba(245, 158, 11, 0.12)",
                        color: "#f59e0b",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        "& .MuiChip-icon": { color: "#f59e0b" },
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {teacher.listOfSubjects?.join(", ") || "No subjects specified"}
                </Typography>
              </Box>
            </Box>

            {/* In-Card Edit Profile Button with Crisp Dimensions */}
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => setIsEditModalOpen(true)}
              startIcon={<Pencil size={15} />}
              sx={{
                height: 40,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                  bgcolor: "primary.main",
                  color: "white",
                },
                transition: "all 0.2s ease",
              }}
            >
              Edit Teacher Profile
            </Button>

            <Divider sx={{ my: 2.5, borderColor: "divider" }} />

            {/* Profile Fields */}
            <InfoItem icon={<Mail size={18} />} label="Email" value={teacher.email} />
            <InfoItem
              icon={<Book size={18} />}
              label="Subject"
              value={teacher.listOfSubjects?.join(", ")}
            />
            <InfoItem icon={<Phone size={18} />} label="Mobile" value={teacher.mobile} />
            <InfoItem
              icon={<GraduationCap size={18} />}
              label="Qualification"
              value={teacher.qualification}
            />
            <InfoItem
              icon={<Briefcase size={18} />}
              label="Experience"
              value={teacher.experience || (teacher as any).experiance}
            />

            {formattedDob && (
              <InfoItem icon={<Calendar size={18} />} label="Date of Birth" value={formattedDob} />
            )}

            {formattedAddress && (
              <InfoItem icon={<MapPin size={18} />} label="Address" value={formattedAddress} />
            )}

            {/* Meeting Link Item */}
            {teacher.joinLink && (
              <InfoItem
                icon={<Video size={18} />}
                label="Personal Meeting Link"
                value={teacher.joinLink}
                action={
                  <Button
                    size="small"
                    variant="text"
                    component="a"
                    href={teacher.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<ExternalLink size={14} />}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Open
                  </Button>
                }
              />
            )}

            {/* About / Bio Notes */}
            {teacher.aboutTeacher && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={0.5}>
                  About Teacher
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {teacher.aboutTeacher}
                </Typography>
              </Box>
            )}

            {/* CV Document Link */}
            {teacher.cvUrl && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component="a"
                  href={teacher.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<FileText size={16} />}
                  sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold", width: "100%" }}
                >
                  View CV Document
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2.5, borderColor: "divider" }} />

            <Typography variant="body2" color="text.secondary" fontWeight="bold" mb={1.5}>
              Subjects ({teacher.listOfSubjects?.length || 0})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {teacher.listOfSubjects && teacher.listOfSubjects.length > 0 ? (
                teacher.listOfSubjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No subjects listed.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Assigned Courses */}
        <Box sx={{ flex: "2 1 600px" }}>
          <Paper
            elevation={0}
            className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
            sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 5, bgcolor: "background.paper" }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Assigned Courses
            </Typography>
            <Divider sx={{ my: 2.5, borderColor: "divider" }} />
            {courses.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {courses.map((course) => (
                  <Paper
                    key={course._id.toString()}
                    elevation={0}
                    className="border border-slate-200 dark:border-slate-800"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {course.title}
                        </Typography>
                        <Chip
                          label={course.noOfClasses > 0 ? "Running" : "Pending"}
                          size="small"
                          color={course.noOfClasses > 0 ? "success" : "warning"}
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Student:{" "}
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {(course.studentId as any)?.fullName || "N/A"}
                        </span>
                      </Typography>
                      <Divider sx={{ my: 1.5, borderColor: "divider" }} />
                      <Typography variant="body2" color="text.primary">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          Classes Left:
                        </span>{" "}
                        <span className="font-bold">{course.noOfClasses}</span>
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href={`/admin/teachers/${id}/${course._id.toString()}`}
                      variant="outlined"
                      color="primary"
                      endIcon={<ArrowRight size={16} />}
                      sx={{
                        mt: 2.5,
                        width: "100%",
                        borderRadius: 3,
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                    >
                      View Details
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                This teacher has not been assigned to any courses yet.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Edit Teacher Modal */}
      {teacher && (
        <EditTeacherModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          teacher={teacher}
          onSuccess={(updatedTeacher) => {
            setTeacher(updatedTeacher);
          }}
        />
      )}
    </Box>
  );
}
