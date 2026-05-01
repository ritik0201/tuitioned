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
  Select,
  Autocomplete,
} from "@mui/material";
import { CourseDetails } from "@/types/admin";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  listOfSubjects?: string[];
}

interface AdminCourseEditModalProps {
  open: boolean;
  onClose: () => void;
  course: CourseDetails; // The course data to edit (populated)
  onUpdateSuccess: (updatedCourse: CourseDetails) => void;
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 700 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AdminCourseEditModal: React.FC<AdminCourseEditModalProps> = ({
  open,
  onClose,
  course,
  onUpdateSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    grade: course.grade,
    classTime: course.classTime || "",
    classDays: course.classDays?.join(", ") || "", // Convert array to comma-separated string
    noOfClasses: course.noOfClasses,
    perClassPrice: course.perClassPrice,
    joinLink: course.joinLink || "",
    classroomLink: course.classroomLink || "",
    teacherId: course.teacherId?._id || "", // Store as string ID from populated object
    paymentStatus: course.paymentStatus || "pending",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

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

  useEffect(() => {
    // Reset form data when course prop changes (e.g., modal opens for a different course)
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        grade: course.grade,
        classTime: course.classTime || "",
        classDays: course.classDays?.join(", ") || "",
        noOfClasses: course.noOfClasses,
        perClassPrice: course.perClassPrice,
        joinLink: course.joinLink || "",
        classroomLink: course.classroomLink || "",
        teacherId: course.teacherId?._id || "",
        paymentStatus: course.paymentStatus || "pending",
      });
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        noOfClasses: Number(formData.noOfClasses),
        perClassPrice: Number(formData.perClassPrice),
        classDays: formData.classDays.split(",").map((day) => day.trim()).filter(Boolean), // Convert back to array
      };

      const res = await fetch(`/api/course/${course._id}`, {
        method: "PUT", // Or PATCH, depending on your API design
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update course.");
      }

      onUpdateSuccess(data.course); // Pass the updated course back to the parent
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
        <Typography variant="h5" component="h2" mb={3}>
          Edit Course: {course.title}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Course Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          required
        />
        <TextField
          label="Grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Class Time (e.g., 10:00 AM - 11:00 AM)"
          name="classTime"
          value={formData.classTime}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Class Days (comma-separated, e.g., Mon, Wed, Fri)"
          name="classDays"
          value={formData.classDays}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Number of Classes"
          name="noOfClasses"
          type="number"
          value={formData.noOfClasses}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Price Per Class"
          name="perClassPrice"
          type="number"
          value={formData.perClassPrice}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Join Link (e.g., Google Meet, Zoom)"
          name="joinLink"
          value={formData.joinLink}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Classroom Link (e.g., Google Classroom)"
          name="classroomLink"
          value={formData.classroomLink}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Autocomplete
          options={teachers}
          getOptionLabel={(option) => `${option.name} (${option.listOfSubjects?.join(", ") || option.email})`}
          value={teachers.find(t => t._id === formData.teacherId) || null}
          onChange={(_, newValue) => {
            setFormData(prev => ({ ...prev, teacherId: newValue?._id || "" }));
          }}
          loading={isLoadingTeachers}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assigned Teacher"
              margin="normal"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {isLoadingTeachers ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdminCourseEditModal;