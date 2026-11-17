"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  BookOpen,
  GraduationCap,
  Search,
  Video,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CourseData = {
  id: string;
  courseName: string;
  studentId?: string;
  studentName: string;
  email?: string;
  studentImage?: string;
  grade: string;
  noOfClasses: number;
  joinLink?: string;
};

const AVATAR_COLORS = [
  "#4f46e5",
  "#059669",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#0284c7",
  "#ea580c",
  "#0d9488",
];

function getAvatarColor(name: string = ""): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string = ""): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teachers-student");
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch courses");
          }
          throw new Error("Your session may have expired. Please log in again.");
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.courseName?.toLowerCase().includes(q) ||
        c.studentName?.toLowerCase().includes(q) ||
        c.grade?.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Header & Simple Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight="800" sx={{ color: "text.primary" }}>
              My Courses
            </Typography>
            <Chip
              label={`${courses.length}`}
              size="small"
              sx={{
                bgcolor: "rgba(99, 102, 241, 0.12)",
                color: "#4f46e5",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: 2,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            All your assigned student courses in one place.
          </Typography>
        </Box>

        {/* Simple Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background border-border text-foreground rounded-xl"
          />
        </div>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
          <CircularProgress size={32} sx={{ color: "primary.main" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Loading courses...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid", borderColor: "error.light" }}>
          <Typography color="error" fontWeight="600">
            {error}
          </Typography>
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 2,
            textAlign: "center",
            borderRadius: 3,
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <FolderOpen size={40} className="mx-auto text-muted-foreground opacity-50 mb-2" />
          <Typography variant="body1" fontWeight="600" sx={{ color: "text.primary" }}>
            No courses found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {searchQuery ? `No courses matching "${searchQuery}"` : "You have no assigned courses yet."}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {filteredCourses.map((course) => {
            const avatarColor = getAvatarColor(course.studentName);
            const classesLeft = course.noOfClasses ?? 0;

            return (
              <Box
                key={course.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "primary.main",
                    boxShadow: "0 8px 20px -4px rgba(79, 70, 229, 0.12)",
                  },
                }}
              >
                {/* Course Name & Classes Left */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: "rgba(99, 102, 241, 0.1)",
                        color: "#4f46e5",
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen size={18} />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="700"
                        noWrap
                        sx={{ color: "text.primary", lineHeight: 1.25 }}
                        title={course.courseName}
                      >
                        {course.courseName}
                      </Typography>
                      {course.grade && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                          <GraduationCap size={12} className="text-muted-foreground" />
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {course.grade}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Chip
                    label={`${classesLeft} ${classesLeft === 1 ? "Class" : "Classes"}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      bgcolor:
                        classesLeft === 0
                          ? "rgba(100, 116, 139, 0.12)"
                          : classesLeft <= 3
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(16, 185, 129, 0.12)",
                      color:
                        classesLeft === 0
                          ? "text.secondary"
                          : classesLeft <= 3
                          ? "#d97706"
                          : "#059669",
                      borderRadius: 1.5,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Student Info */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Avatar
                    src={course.studentImage}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: avatarColor,
                      color: "#ffffff",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(course.studentName)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight="600" noWrap sx={{ color: "text.primary" }}>
                      {course.studentName}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 0.5 }}>
                  {course.joinLink ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(course.joinLink, "_blank", "noopener,noreferrer")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-8.5 text-xs flex items-center justify-center gap-1"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join
                    </Button>
                  ) : null}

                  <Button
                    variant={course.joinLink ? "outline" : "default"}
                    size="sm"
                    onClick={() => router.push(`/teacher/courses/${course.id}`)}
                    className={`font-semibold rounded-xl h-8.5 text-xs flex items-center justify-center gap-1 transition-all ${
                      course.joinLink
                        ? "flex-1 border-border hover:bg-muted text-foreground"
                        : "w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    View Course
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </motion.div>
  );
}
