"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  MapPin,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Loader2,
  X,
  FileEdit,
  Sparkles,
} from "lucide-react";
import { StudentFromAPI } from "@/app/admin/students/[id]/page";

const POPULAR_GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "College / University",
];

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentFromAPI;
  onSuccess: (updatedStudent: StudentFromAPI) => void;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: EditStudentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [grade, setGrade] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [country, setCountry] = useState("");
  const [studentStatus, setStudentStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
  });

  // Active section tab
  const [activeTab, setActiveTab] = useState<"general" | "academic" | "address">("general");

  // Populate fields when student changes or modal opens
  useEffect(() => {
    if (student && isOpen) {
      setName(student.name || "");
      setEmail(student.email || "");
      setMobile(student.mobile === "N/A" ? "" : student.mobile || "");
      
      let dobString = "";
      if (student.dateOfBirth) {
        try {
          dobString = new Date(student.dateOfBirth).toISOString().split("T")[0];
        } catch {
          dobString = "";
        }
      }
      setDateOfBirth(dobString);
      setGrade(student.grade === "N/A" ? "" : student.grade || "");
      setFatherName(student.fatherName === "N/A" ? "" : student.fatherName || "");
      setCountry(student.country === "N/A" ? "" : student.country || student.address?.country || "");
      setStudentStatus(student.studentStatus || "approved");
      setAddress({
        street: student.address?.street || "",
        city: student.address?.city || "",
        state: student.address?.state || "",
        country: student.address?.country || student.country || "",
      });
      setErrorMessage(null);
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Student Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          dateOfBirth: dateOfBirth || null,
          fatherName: fatherName.trim(),
          grade: grade.trim(),
          country: country.trim(),
          address: {
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            country: country.trim() || address.country.trim(),
          },
          studentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update student profile.");
      }

      toast.success(data.message || "Student profile updated successfully!");
      onSuccess(data.student);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while saving changes.");
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-3xl max-h-[90vh] h-auto flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl z-50 transition-all duration-200"
      >
        {/* Pinned Header */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 ring-4 ring-indigo-500/5">
                <FileEdit className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Edit Student Profile
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update personal details, academic standing, and guardian info for <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>.
                </DialogDescription>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "general"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={14} /> Personal Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("academic")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "academic"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap size={14} /> Academic & Guardian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "address"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapPin size={14} /> Address & Location
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User size={14} className="text-indigo-500" /> Full Name *
                    </Label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail size={14} className="text-indigo-500" /> Email Address *
                    </Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone size={14} className="text-indigo-500" /> Contact Number
                    </Label>
                    <Input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-500" /> Date of Birth
                    </Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-500" /> Enrollment / Student Status
                  </Label>
                  <Select
                    value={studentStatus}
                    onValueChange={(val: "pending" | "approved" | "rejected") => setStudentStatus(val)}
                  >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Approved / Active Student</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">Suspended / Rejected</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Academic & Guardian Tab */}
            {activeTab === "academic" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-indigo-500" /> Academic Grade / Level
                  </Label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Grade 10, Year 9, A-Levels"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                  {/* Quick Select Badges */}
                  <div className="pt-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Quick Select:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                            grade.toLowerCase() === g.toLowerCase()
                              ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-500" /> Guardian / Father Name
                  </Label>
                  <Input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Robert Johnson"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    Primary parent or emergency guardian linked to this student profile.
                  </p>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe size={14} className="text-indigo-500" /> Country of Residence
                  </Label>
                  <Input
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setAddress((prev) => ({ ...prev, country: e.target.value }));
                    }}
                    placeholder="e.g. United Kingdom, United States, India"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-500" /> Street Address
                  </Label>
                  <Input
                    value={address.street}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, street: e.target.value }))
                    }
                    placeholder="e.g. 123 High Street, Suite 4B"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      City
                    </Label>
                    <Input
                      value={address.city}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="e.g. London"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      State / Province / Region
                    </Label>
                    <Input
                      value={address.state}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, state: e.target.value }))
                      }
                      placeholder="e.g. Greater London"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Modal Footer */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Save Student Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
