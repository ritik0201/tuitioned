"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Copy,
  BookOpen,
  User,
  Video,
  Layers,
  Sparkles,
  Zap,
  Check,
  X,
} from "lucide-react";
import { CourseDetails } from "@/types/admin";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
  listOfSubjects?: string[];
}

interface ScheduleRow {
  studentDay: string;
  studentTime: string;
  studentSchedule: string;
  teacherDay: string;
  teacherTime: string;
  teacherSchedule: string;
  isCustomStudentTime?: boolean;
  isCustomTeacherTime?: boolean;
}

interface AdminCourseEditModalProps {
  open: boolean;
  onClose: () => void;
  course: CourseDetails;
  onUpdateSuccess: (updatedCourse: CourseDetails) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = [
  "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM",
];

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 750, md: 840 },
  bgcolor: "background.paper",
  borderRadius: 3.5,
  boxShadow: 24,
  p: { xs: 2.5, sm: 4 },
  maxHeight: "92vh",
  overflowY: "auto",
};

const formatSlotSchedule = (time?: string, day?: string) => {
  const t = (time || "").trim();
  const d = (day || "").trim();
  if (t && d) return `${t} - ${d}`;
  return t || d || "";
};

const AdminCourseEditModal: React.FC<AdminCourseEditModalProps> = ({
  open,
  onClose,
  course,
  onUpdateSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: course.title || "",
    description: course.description || "",
    grade: course.grade || "",
    classTime: course.classTime || "",
    teacherClassTime: course.teacherClassTime || "",
    noOfClasses: course.noOfClasses ?? 0,
    perClassPrice: course.perClassPrice ?? 0,
    currency: course.currency || "INR",
    joinLink: course.joinLink || "",
    classroomLink: course.classroomLink || "",
    teacherId: course.teacherId?._id || "",
    paymentStatus: course.paymentStatus || "pending",
    teacherPerClassPrice: course.teacherPerClassPrice || 0,
    noOfclassTeacher: course.noOfclassTeacher || 0,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await fetch("/api/teachers?status=approved");
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

  // Sync state when course changes or modal opens
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        grade: course.grade || "",
        classTime: course.classTime || "",
        teacherClassTime: course.teacherClassTime || "",
        noOfClasses: course.noOfClasses ?? 0,
        perClassPrice: course.perClassPrice ?? 0,
        currency: course.currency || "INR",
        joinLink: course.joinLink || "",
        classroomLink: course.classroomLink || "",
        teacherId: course.teacherId?._id || "",
        paymentStatus: course.paymentStatus || "pending",
        teacherPerClassPrice: course.teacherPerClassPrice || 0,
        noOfclassTeacher: course.noOfclassTeacher || 0,
      });

      const initialDays = Array.isArray(course.classDays) ? [...course.classDays] : [];
      setSelectedDays(initialDays);

      // Parse schedules
      if (Array.isArray(course.schedules) && course.schedules.length > 0) {
        const parsedRows: ScheduleRow[] = course.schedules.map((s) => {
          let sDay = s.studentDay || "";
          let sTime = s.studentTime || "";
          if (!sDay && s.studentSchedule) {
            const matched = DAYS.find((d) =>
              s.studentSchedule?.toLowerCase().includes(d.toLowerCase().substring(0, 3))
            );
            if (matched) sDay = matched;
          }
          if (!sTime && s.studentSchedule) {
            const m =
              s.studentSchedule.match(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b/i) ||
              s.studentSchedule.match(/\b\d{1,2}:\d{2}\b/);
            if (m) sTime = m[0];
          }

          let tDay = s.teacherDay || "";
          let tTime = s.teacherTime || "";
          if (!tDay && s.teacherSchedule) {
            const matched = DAYS.find((d) =>
              s.teacherSchedule?.toLowerCase().includes(d.toLowerCase().substring(0, 3))
            );
            if (matched) tDay = matched;
          }
          if (!tTime && s.teacherSchedule) {
            const m =
              s.teacherSchedule.match(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b/i) ||
              s.teacherSchedule.match(/\b\d{1,2}:\d{2}\b/);
            if (m) tTime = m[0];
          }

          return {
            studentDay: sDay,
            studentTime: sTime,
            studentSchedule: s.studentSchedule || formatSlotSchedule(sTime, sDay),
            teacherDay: tDay,
            teacherTime: tTime,
            teacherSchedule: s.teacherSchedule || formatSlotSchedule(tTime, tDay),
            isCustomStudentTime: Boolean(sTime && !TIME_OPTIONS.includes(sTime)),
            isCustomTeacherTime: Boolean(tTime && !TIME_OPTIONS.includes(tTime)),
          };
        });
        setSchedules(parsedRows);
      } else if (initialDays.length > 0) {
        // Build initial slot from days
        const generated = initialDays.map((d) => ({
          studentDay: d,
          studentTime: course.classTime || "",
          studentSchedule: formatSlotSchedule(course.classTime, d),
          teacherDay: d,
          teacherTime: course.teacherClassTime || course.classTime || "",
          teacherSchedule: formatSlotSchedule(course.teacherClassTime || course.classTime, d),
          isCustomStudentTime: false,
          isCustomTeacherTime: false,
        }));
        setSchedules(generated);
      } else {
        setSchedules([
          {
            studentDay: "",
            studentTime: "",
            studentSchedule: "",
            teacherDay: "",
            teacherTime: "",
            teacherSchedule: "",
            isCustomStudentTime: false,
            isCustomTeacherTime: false,
          },
        ]);
      }
    }
  }, [course]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const toggleDay = (day: string) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(nextDays);
  };

  const handleStudentDayChange = (index: number, day: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      const newSchedule = formatSlotSchedule(cur.studentTime, day);
      updated[index] = {
        ...cur,
        studentDay: day,
        studentSchedule: newSchedule,
      };
      return updated;
    });
  };

  const handleStudentTimeChange = (index: number, timeVal: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      if (timeVal === "custom") {
        updated[index] = {
          ...cur,
          isCustomStudentTime: true,
        };
      } else {
        updated[index] = {
          ...cur,
          isCustomStudentTime: false,
          studentTime: timeVal,
          studentSchedule: formatSlotSchedule(timeVal, cur.studentDay),
        };
      }
      return updated;
    });
  };

  const handleCustomStudentTime = (index: number, val: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      updated[index] = {
        ...cur,
        studentTime: val,
        studentSchedule: formatSlotSchedule(val, cur.studentDay),
      };
      return updated;
    });
  };

  const handleTeacherDayChange = (index: number, day: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      updated[index] = {
        ...cur,
        teacherDay: day,
        teacherSchedule: formatSlotSchedule(cur.teacherTime, day),
      };
      return updated;
    });
  };

  const handleTeacherTimeChange = (index: number, timeVal: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      if (timeVal === "custom") {
        updated[index] = {
          ...cur,
          isCustomTeacherTime: true,
        };
      } else {
        updated[index] = {
          ...cur,
          isCustomTeacherTime: false,
          teacherTime: timeVal,
          teacherSchedule: formatSlotSchedule(timeVal, cur.teacherDay),
        };
      }
      return updated;
    });
  };

  const handleCustomTeacherTime = (index: number, val: string) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      updated[index] = {
        ...cur,
        teacherTime: val,
        teacherSchedule: formatSlotSchedule(val, cur.teacherDay),
      };
      return updated;
    });
  };

  const copyStudentScheduleToTeacher = (index: number) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      updated[index] = {
        ...cur,
        teacherDay: cur.studentDay || "",
        teacherTime: cur.studentTime || "",
        isCustomTeacherTime: cur.isCustomStudentTime,
        teacherSchedule: formatSlotSchedule(cur.studentTime, cur.studentDay),
      };
      return updated;
    });
    toast.success("Copied student timing to teacher schedule");
  };

  const addScheduleSlot = () => {
    setSchedules((prev) => [
      ...prev,
      {
        studentDay: "",
        studentTime: "",
        studentSchedule: "",
        teacherDay: "",
        teacherTime: "",
        teacherSchedule: "",
        isCustomStudentTime: false,
        isCustomTeacherTime: false,
      },
    ]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedules((prev) => {
      if (prev.length <= 1) {
        return [
          {
            studentDay: "",
            studentTime: "",
            studentSchedule: "",
            teacherDay: "",
            teacherTime: "",
            teacherSchedule: "",
            isCustomStudentTime: false,
            isCustomTeacherTime: false,
          },
        ];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const validSchedules = schedules
        .map((s) => {
          const studentSchedule =
            s.studentSchedule?.trim() || formatSlotSchedule(s.studentTime, s.studentDay);
          const teacherSchedule =
            s.teacherSchedule?.trim() || formatSlotSchedule(s.teacherTime, s.teacherDay);
          return {
            studentDay: s.studentDay || "",
            studentTime: s.studentTime || "",
            studentSchedule,
            teacherDay: s.teacherDay || "",
            teacherTime: s.teacherTime || "",
            teacherSchedule,
          };
        })
        .filter(
          (s) =>
            s.studentSchedule ||
            s.teacherSchedule ||
            (s.studentDay && s.studentTime) ||
            (s.teacherDay && s.teacherTime)
        );

      const studentTimeSummary = validSchedules
        .map((s) => s.studentSchedule)
        .filter(Boolean)
        .join(", ");

      const teacherTimeSummary = validSchedules
        .map((s) => s.teacherSchedule)
        .filter(Boolean)
        .join(", ");

      const extractedDays = Array.from(
        new Set([
          ...selectedDays,
          ...validSchedules.map((s) => s.studentDay).filter(Boolean),
          ...validSchedules.map((s) => s.teacherDay).filter(Boolean),
        ] as string[])
      );

      const payload = {
        ...formData,
        schedules: validSchedules,
        classDays: extractedDays.length > 0 ? extractedDays : selectedDays,
        classTime: studentTimeSummary || formData.classTime,
        teacherClassTime: teacherTimeSummary || formData.teacherClassTime,
        noOfClasses: Number(formData.noOfClasses),
        perClassPrice: Number(formData.perClassPrice),
        currency: (formData.currency || "INR").toUpperCase(),
        teacherPerClassPrice: Number(formData.teacherPerClassPrice || 0),
        noOfclassTeacher: Number(formData.noOfclassTeacher),
      };

      const res = await fetch(`/api/course/${course._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update course.");
      }

      toast.success("Course schedules and details updated successfully!");
      onUpdateSuccess(data.course);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: "text.primary" }}>
              Edit Course Details & Schedules
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Modify course information, assigned teacher, and student/teacher days & timings.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <X size={20} />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* SECTION 1: COURSE BASICS */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <BookOpen size={16} /> Course Basics
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
            <TextField
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </Box>

          <TextField
            label="Course Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECTION 2: CLASS DAYS & TIMING SCHEDULER */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Calendar size={16} /> Recurring Class Days & Timing
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
            Select the weekdays the class happens, and configure the student and teacher schedule slots.
          </Typography>

          {/* Day Selector Chips */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="700" sx={{ mb: 1, color: "text.primary" }}>
              Active Weekdays
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <Chip
                    key={day}
                    label={day}
                    clickable
                    onClick={() => toggleDay(day)}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 0.5,
                      bgcolor: isSelected ? "primary.main" : "action.hover",
                      color: isSelected ? "#ffffff" : "text.primary",
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      "&:hover": {
                        bgcolor: isSelected ? "primary.dark" : "action.selected",
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Multi-slot Schedule Rows */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" fontWeight="700" sx={{ color: "text.primary" }}>
                Class Timing Slots ({schedules.length})
              </Typography>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={addScheduleSlot}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Plus size={14} /> Add Slot
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {schedules.map((row, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="800" sx={{ color: "primary.main", textTransform: "uppercase" }}>
                      Slot #{idx + 1}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Copy student schedule to teacher schedule" arrow>
                        <Button
                          type="button"
                          variant="text"
                          size="small"
                          onClick={() => copyStudentScheduleToTeacher(idx)}
                          sx={{ textTransform: "none", fontSize: "0.72rem", color: "text.secondary", "&:hover": { color: "primary.main" }, display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <Copy size={12} /> Sync to Teacher
                        </Button>
                      </Tooltip>

                      {schedules.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeScheduleSlot(idx)}
                          sx={{ color: "error.main", p: 0.5 }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Student Schedule Controls */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="700" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
                      Student Timing:
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                      <TextField
                        select
                        label="Student Day"
                        size="small"
                        value={row.studentDay}
                        onChange={(e) => handleStudentDayChange(idx, e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="">-- Select Day --</MenuItem>
                        {DAYS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </TextField>

                      {row.isCustomStudentTime ? (
                        <TextField
                          label="Custom Student Time"
                          size="small"
                          placeholder="e.g. 10:00 AM"
                          value={row.studentTime}
                          onChange={(e) => handleCustomStudentTime(idx, e.target.value)}
                          fullWidth
                          helperText="Enter exact time"
                        />
                      ) : (
                        <TextField
                          select
                          label="Student Time"
                          size="small"
                          value={TIME_OPTIONS.includes(row.studentTime) ? row.studentTime : (row.studentTime ? "custom" : "")}
                          onChange={(e) => handleStudentTimeChange(idx, e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="">-- Select Time --</MenuItem>
                          {TIME_OPTIONS.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                          <MenuItem value="custom">+ Custom Time...</MenuItem>
                        </TextField>
                      )}
                    </Box>
                  </Box>

                  {/* Teacher Schedule Controls */}
                  <Box>
                    <Typography variant="caption" fontWeight="700" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
                      Teacher Timing:
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                      <TextField
                        select
                        label="Teacher Day"
                        size="small"
                        value={row.teacherDay}
                        onChange={(e) => handleTeacherDayChange(idx, e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="">-- Select Day --</MenuItem>
                        {DAYS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </TextField>

                      {row.isCustomTeacherTime ? (
                        <TextField
                          label="Custom Teacher Time"
                          size="small"
                          placeholder="e.g. 10:00 AM"
                          value={row.teacherTime}
                          onChange={(e) => handleCustomTeacherTime(idx, e.target.value)}
                          fullWidth
                          helperText="Enter exact time"
                        />
                      ) : (
                        <TextField
                          select
                          label="Teacher Time"
                          size="small"
                          value={TIME_OPTIONS.includes(row.teacherTime) ? row.teacherTime : (row.teacherTime ? "custom" : "")}
                          onChange={(e) => handleTeacherTimeChange(idx, e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="">-- Select Time --</MenuItem>
                          {TIME_OPTIONS.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                          <MenuItem value="custom">+ Custom Time...</MenuItem>
                        </TextField>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Schedule Text Overrides / Summaries */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
            <TextField
              label="Student Class Time Summary"
              name="classTime"
              value={formData.classTime}
              onChange={handleChange}
              fullWidth
              size="small"
              helperText="Summary shown to student"
            />
            <TextField
              label="Teacher Class Time Summary"
              name="teacherClassTime"
              value={formData.teacherClassTime}
              onChange={handleChange}
              fullWidth
              size="small"
              helperText="Summary shown to teacher"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECTION 3: FACULTY & ENROLLMENT */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <User size={16} /> Faculty & Session Count
          </Typography>

          <Autocomplete
            options={teachers}
            getOptionLabel={(option) => `${option.name} (${option.listOfSubjects?.join(", ") || option.email})`}
            value={teachers.find((t) => t.id === formData.teacherId) || null}
            onChange={(_, newValue) => {
              setFormData((prev) => ({ ...prev, teacherId: newValue?.id || "" }));
            }}
            loading={isLoadingTeachers}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned Teacher"
                size="small"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {isLoadingTeachers ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Total Sessions"
              name="noOfClasses"
              type="number"
              value={formData.noOfClasses}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              inputProps={{ min: 0 }}
            />

            <TextField
              select
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {SUPPORTED_CURRENCIES.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={`Price Per Class (${formData.currency || "INR"})`}
              name="perClassPrice"
              type="number"
              value={formData.perClassPrice}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
            <TextField
              label="Teacher Payout Per Class (₹)"
              name="teacherPerClassPrice"
              type="number"
              value={formData.teacherPerClassPrice}
              onChange={handleChange}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Teacher Completed Sessions"
              name="noOfclassTeacher"
              type="number"
              value={formData.noOfclassTeacher}
              onChange={handleChange}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECTION 4: MEETING & CLASSROOM LINKS */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Video size={16} /> Meeting & Online Links
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Join Meeting Link (G-Meet / Zoom)"
              name="joinLink"
              value={formData.joinLink}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="https://meet.google.com/..."
            />
            <TextField
              label="Google Classroom Link"
              name="classroomLink"
              value={formData.classroomLink}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="https://classroom.google.com/..."
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, bgcolor: "primary.main", minWidth: 140 }}
          >
            {isSubmitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" /> Saving...
              </Box>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdminCourseEditModal;
