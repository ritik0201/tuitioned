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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Briefcase,
  BookOpen,
  Video,
  FileText,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Loader2,
  Plus,
  X,
  FileEdit,
} from "lucide-react";
import { TeacherFromAPI } from "@/app/admin/teachers/[id]/page";

const POPULAR_SUBJECTS = [
  "Maths",
  "Science",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
  "Coding",
  "Economics",
  "Physical Education",
  "Business Studies",
  "Accountancy",
  "Hindi",
];

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherFromAPI;
  onSuccess: (updatedTeacher: TeacherFromAPI) => void;
}

export default function EditTeacherModal({
  isOpen,
  onClose,
  teacher,
  onSuccess,
}: EditTeacherModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [listOfSubjects, setListOfSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [teacherStatus, setTeacherStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [aboutTeacher, setAboutTeacher] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
  });

  // Active section tab
  const [activeTab, setActiveTab] = useState<"general" | "academic" | "links" | "address">("general");

  // Populate fields when teacher changes or modal opens
  useEffect(() => {
    if (teacher && isOpen) {
      setFullName(teacher.fullName || "");
      setEmail(teacher.email || "");
      setMobile(teacher.mobile || "");
      
      let dobString = "";
      if (teacher.dateOfBirth) {
        try {
          dobString = new Date(teacher.dateOfBirth).toISOString().split("T")[0];
        } catch {
          dobString = "";
        }
      }
      setDateOfBirth(dobString);
      setQualification(teacher.qualification || "");
      setExperience(teacher.experience || (teacher as any).experiance || "");
      setListOfSubjects(teacher.listOfSubjects ? [...teacher.listOfSubjects] : []);
      setJoinLink(teacher.joinLink || "");
      setCvUrl(teacher.cvUrl || "");
      setProfileImage(teacher.profileImage || "");
      setTeacherStatus(teacher.teacherStatus || "pending");
      setAboutTeacher(teacher.aboutTeacher || "");
      setAddress({
        street: teacher.address?.street || "",
        city: teacher.address?.city || "",
        state: teacher.address?.state || "",
        country: teacher.address?.country || "",
      });
      setErrorMessage(null);
      setNewSubjectInput("");
    }
  }, [teacher, isOpen]);

  const handleAddSubject = (subjectToAdd?: string) => {
    const trimmed = (subjectToAdd || newSubjectInput).trim();
    if (!trimmed) return;
    
    // Check case-insensitive duplicate
    if (listOfSubjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added.`);
      setNewSubjectInput("");
      return;
    }

    setListOfSubjects([...listOfSubjects, trimmed]);
    setNewSubjectInput("");
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setListOfSubjects(listOfSubjects.filter((s) => s !== subjectToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/teachers/${teacher._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          dateOfBirth: dateOfBirth || null,
          qualification: qualification.trim(),
          experience: experience.trim(),
          listOfSubjects,
          joinLink: joinLink.trim(),
          cvUrl: cvUrl.trim(),
          profileImage: profileImage.trim(),
          teacherStatus,
          aboutTeacher: aboutTeacher.trim(),
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update teacher profile.");
      }

      toast.success(data.message || "Teacher profile updated successfully!");
      onSuccess(data.teacher);
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
                  Edit Teacher Profile
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update personal information, academic credentials, subjects, and account status.
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "general"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={14} /> Personal Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("academic")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "academic"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap size={14} /> Academic & Subjects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "links"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Video size={14} /> Meeting & Bio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "address"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapPin size={14} /> Address
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
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
                      placeholder="e.g. teacher@example.com"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone size={14} className="text-indigo-500" /> Mobile / WhatsApp
                    </Label>
                    <Input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 9876543210"
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

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" /> Teacher Account Status
                  </Label>
                  <Select
                    value={teacherStatus}
                    onValueChange={(val: any) => setTeacherStatus(val)}
                  >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck size={14} /> Approved
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock size={14} /> Pending Approval
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                          <ShieldAlert size={14} /> Rejected
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Academic & Subjects Tab */}
            {activeTab === "academic" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-emerald-500" /> Qualification
                    </Label>
                    <Input
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. M.Sc. Mathematics, B.Tech"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-emerald-500" /> Years of Experience
                    </Label>
                    <Input
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 5 Years, 3+ years"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Subjects Management */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-indigo-500" /> Subjects Taught ({listOfSubjects.length})
                    </Label>
                    {listOfSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setListOfSubjects([])}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Add subject input */}
                  <div className="flex gap-2">
                    <Input
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                      placeholder="Type a subject name and press Enter..."
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddSubject()}
                      className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold px-4"
                    >
                      <Plus size={16} className="mr-1" /> Add
                    </Button>
                  </div>

                  {/* Current subjects badges */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 min-h-[60px] flex flex-wrap gap-1.5 items-center">
                    {listOfSubjects.length > 0 ? (
                      listOfSubjects.map((sub) => (
                        <Badge
                          key={sub}
                          className="bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(sub)}
                            className="hover:text-rose-500 transition cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No subjects added yet. Add subjects above or select from suggestions below.</span>
                    )}
                  </div>

                  {/* Popular subject quick-adds */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick Add Suggestions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SUBJECTS.map((popSub) => {
                        const isAdded = listOfSubjects.some((s) => s.toLowerCase() === popSub.toLowerCase());
                        return (
                          <button
                            key={popSub}
                            type="button"
                            onClick={() => (isAdded ? handleRemoveSubject(popSub) : handleAddSubject(popSub))}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1 ${
                              isAdded
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                            }`}
                          >
                            {isAdded ? "✓" : "+"} {popSub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting & Bio Tab */}
            {activeTab === "links" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Video size={14} className="text-blue-500" /> Personal Meeting Link (Google Meet / Zoom)
                  </Label>
                  <Input
                    type="url"
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    This link will be used automatically when new classes or courses are scheduled with this teacher.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-500" /> CV / Resume Link
                  </Label>
                  <Input
                    type="url"
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or Cloudinary URL"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-purple-500" /> Profile Picture URL
                  </Label>
                  <Input
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or image URL"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-500" /> About Teacher / Bio Notes
                  </Label>
                  <Textarea
                    rows={4}
                    value={aboutTeacher}
                    onChange={(e) => setAboutTeacher(e.target.value)}
                    placeholder="Brief background, teaching methodology, specializations..."
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-rose-500" /> Street Address
                  </Label>
                  <Input
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="e.g. 123 Main Street, Apt 4B"
                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</Label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Kolkata"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State / Province</Label>
                    <Input
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="e.g. West Bengal"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Country</Label>
                    <Input
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      placeholder="e.g. India"
                      className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pinned Footer */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Editing: <span className="font-bold text-slate-700 dark:text-slate-300">{teacher.fullName}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={onClose}
                className="rounded-xl border-slate-200 dark:border-slate-800 font-bold px-4"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-lg shadow-indigo-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
