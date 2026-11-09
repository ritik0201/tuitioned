"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Hash,
  Trophy,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Zap,
  Check,
  Calculator,
  Globe,
  Code2,
  FlaskConical,
  AlertTriangle,
  BookMarked,
  ShieldAlert,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  GRADE_CURRICULUM,
  checkHigherClassTopic,
  parseGrade,
} from "@/lib/aiConfig";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const TOPIC_SUGGESTIONS = [
  { label: "Mathematics", value: "Mathematics & Numbers", icon: Calculator },
  { label: "Solar System", value: "Astronomy & Solar System", icon: Globe },
  { label: "Coding Fun", value: "Computer Science & Logic", icon: Code2 },
  { label: "Grammar & Words", value: "English Grammar & Vocabulary", icon: BookOpen },
  { label: "Science Lab", value: "General Science Concepts", icon: FlaskConical },
  { label: "Nature & Physics", value: "Nature & Physical World", icon: Zap },
];

export default function TestPage() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [classLevel, setClassLevel] = useState("10");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [activeQuizType, setActiveQuizType] = useState<"custom" | "curriculum">("custom");

  // Load student profile grade if available
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/student-profile")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.profile?.grade) {
            const parsed = parseGrade(data.profile.grade);
            setClassLevel(String(parsed));
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id]);

  const currentGradeNum = parseGrade(classLevel);
  const currentCurriculum = GRADE_CURRICULUM[currentGradeNum] || GRADE_CURRICULUM[10];

  // Real-time guardrail check on user-entered topic
  const guardrail = topic.trim()
    ? checkHigherClassTopic(currentGradeNum, topic)
    : { allowed: true };

  const generateQuestions = async (isCurriculum = false) => {
    if (!isCurriculum && !topic.trim()) {
      setError("Please enter a quiz topic, or click 'Generate Curriculum Test' for standard syllabus questions.");
      return;
    }
    if (!classLevel) {
      setError("Please select a target grade level.");
      return;
    }

    // Guardrail: Do not allow students in lower grades to generate higher class tests
    if (!isCurriculum && topic.trim()) {
      const topicCheck = checkHigherClassTopic(currentGradeNum, topic);
      if (!topicCheck.allowed) {
        setError(
          topicCheck.reason ||
            `Higher class topics are not permitted for Grade ${currentGradeNum}. Please choose a grade-appropriate topic.`
        );
        return;
      }
    }

    setIsGenerating(true);
    setError("");
    setQuestions([]);
    setAnswers([]);
    setIsSubmitted(false);
    setActiveQuizType(isCurriculum ? "curriculum" : "custom");

    try {
      const finalTopic =
        topic.trim() ||
        (isCurriculum ? `Grade ${currentGradeNum} Official School Curriculum` : "");

      const prompt = isCurriculum
        ? `Generate ${numQuestions} multiple choice questions strictly aligned with Grade ${currentGradeNum} official school curriculum on topic: ${finalTopic}. Return response as a valid JSON array of objects with "question", "options" (4 strings), "correctAnswer" (0-3).`
        : `Generate ${numQuestions} multiple choice questions for a Grade ${currentGradeNum} student on the topic: ${finalTopic}.
STRICT RULE: Only use age-appropriate concepts for Grade ${currentGradeNum}. Each question should have 4 options. Return the response as a valid JSON array of objects, where each object has:
- "question": string
- "options": array of 4 strings
- "correctAnswer": number (0-3 index of the correct option)

Do not include any other text, just the JSON array.`;

      const response = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          grade: currentGradeNum,
          isCurriculum,
          topic: finalTopic,
          numQuestions: parseInt(numQuestions, 10),
          history: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate questions. Please try again.");
        return;
      }

      if (data.text) {
        const cleanText = data.text.replace(/```json\n?|```/g, "").trim();
        try {
          const parsedQuestions = JSON.parse(cleanText);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            setAnswers(new Array(parsedQuestions.length).fill(-1));
          } else {
            setError("Failed to generate questions. The AI returned an unexpected format.");
          }
        } catch (parseErr) {
          console.error("Error parsing AI response:", parseErr);
          setError("Failed to understand the AI response. Please try again.");
        }
      } else {
        setError(data.error || "Failed to generate questions. Please try again.");
      }
    } catch (err: any) {
      console.error("Error generating questions:", err);
      setError(err?.message || "An error occurred while generating questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitTest = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setIsSubmitted(true);
  };

  const resetTest = () => {
    setQuestions([]);
    setAnswers([]);
    setIsSubmitted(false);
    setScore(0);
    setError("");
  };

  const filledAnswersCount = answers.filter((a) => a !== -1).length;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-4 px-2 font-sans select-none transition-colors duration-200">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-none">
              <Zap className="h-3 w-3 text-amber-500 dark:text-yellow-400" />
              AI Quiz Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
              Academic Assessment
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Grade-tailored quizzes and curriculum tests powered by Google Gemini AI!
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Badge className="px-3 py-1.5 rounded-none font-black text-xs uppercase bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              Grade {classLevel}
            </Badge>
            <Badge className="px-3 py-1.5 rounded-none font-black text-xs uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40">
              {numQuestions} Questions
            </Badge>
          </div>
        </div>

        {!questions.length && !isGenerating && (
          <Card className="border border-slate-200 dark:border-slate-800 rounded-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Configure Quiz
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Grade {classLevel} Syllabus Standard</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Target Grade and Number of Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="classLevel"
                    className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-green-400" />
                    Target Grade
                  </Label>
                  <Select
                    value={classLevel}
                    onValueChange={(val) => {
                      setClassLevel(val);
                      setError("");
                    }}
                  >
                    <SelectTrigger className="text-xs font-bold py-3 rounded-none border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem
                          key={i}
                          value={`${i + 1}`}
                          className="text-xs font-bold cursor-pointer rounded-none"
                        >
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="numQuestions"
                    className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Number of Questions
                  </Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger className="text-xs font-bold py-3 rounded-none border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      <SelectItem value="5" className="text-xs font-bold cursor-pointer rounded-none">
                        5 Questions (Quick)
                      </SelectItem>
                      <SelectItem value="10" className="text-xs font-bold cursor-pointer rounded-none">
                        10 Questions (Standard)
                      </SelectItem>
                      <SelectItem value="15" className="text-xs font-bold cursor-pointer rounded-none">
                        15 Questions (Challenge)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Official Grade Curriculum Highlights */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Official Grade {classLevel} Curriculum Chapters
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    Syllabus Standard
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {currentCurriculum.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {currentCurriculum.topics.map((t, idx) => {
                    const isSelected = topic === t.title;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTopic(t.title);
                          setError("");
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-none border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-emerald-300/60 dark:border-emerald-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        }`}
                      >
                        <Check className={`w-3 h-3 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                        <span>{t.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="topic"
                    className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Custom Topic or Subject
                  </Label>
                  {topic && (
                    <button
                      type="button"
                      onClick={() => setTopic("")}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <Input
                  id="topic"
                  placeholder={`e.g. ${currentCurriculum.topics[0]?.title || "Chapter name or subject"}...`}
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setError("");
                  }}
                  className={`text-sm font-bold py-3 px-4 rounded-none border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 ${
                    !guardrail.allowed
                      ? "border-amber-500 ring-1 ring-amber-500/50"
                      : "border-slate-300 dark:border-slate-800"
                  }`}
                />

                {/* Higher Class Guardrail Warning */}
                {!guardrail.allowed && (
                  <Alert
                    variant="destructive"
                    className="rounded-none border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 py-3"
                  >
                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-xs font-black uppercase tracking-wider">
                      Higher Class Topic Restricted
                    </AlertTitle>
                    <AlertDescription className="text-xs font-semibold mt-1">
                      {guardrail.reason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Quick General Topic Chips */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">
                    Quick General Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_SUGGESTIONS.map((chip, idx) => {
                      const ChipIcon = chip.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setTopic(chip.value);
                            setError("");
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-none border transition-all cursor-pointer flex items-center gap-1.5 ${
                            topic === chip.value
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                              : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <ChipIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-none border border-red-500/50 bg-red-500/10"
                >
                  <AlertDescription className="text-red-600 dark:text-red-400 font-bold text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons: Curriculum Button & Custom Quiz Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. CURRICULUM BUTTON (Requested feature) */}
                <Button
                  type="button"
                  onClick={() => generateQuestions(true)}
                  disabled={isGenerating}
                  className="w-full text-xs font-black uppercase tracking-widest py-4 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white transition-all border border-emerald-400 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {isGenerating && activeQuizType === "curriculum" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Generating Curriculum Quiz...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 text-emerald-200" />
                      <span>Curriculum Test (Grade {classLevel})</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    </>
                  )}
                </Button>

                {/* 2. CUSTOM TOPIC QUIZ BUTTON */}
                <Button
                  type="button"
                  onClick={() => generateQuestions(false)}
                  disabled={isGenerating || !guardrail.allowed || !topic.trim()}
                  className="w-full text-xs font-black uppercase tracking-widest py-4 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-400 cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating && activeQuizType === "custom" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Generating Custom Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span>Generate Custom Quiz</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  💡 Tip: Click <strong>Curriculum Test</strong> to generate an official Grade {classLevel} syllabus test automatically.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="border border-indigo-500/50 rounded-none bg-white dark:bg-slate-900 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <Sparkles className="h-12 w-12 animate-pulse text-indigo-600 dark:text-indigo-400" />
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {activeQuizType === "curriculum"
                    ? `Building Official Grade ${classLevel} Curriculum Test...`
                    : `Crafting Questions with AI...`}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {activeQuizType === "curriculum"
                    ? `Generating syllabus-compliant questions for Grade ${classLevel} standards.`
                    : `Analyzing ${topic} for Grade ${classLevel} assessment.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && !isSubmitted && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">
                    Active Quiz
                  </span>
                  {activeQuizType === "curriculum" ? (
                    <Badge className="rounded-none bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-black uppercase">
                      Official Curriculum Test
                    </Badge>
                  ) : (
                    <Badge className="rounded-none bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 text-[10px] font-black uppercase">
                      Custom Quiz
                    </Badge>
                  )}
                  <Badge className="rounded-none bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase">
                    Grade {classLevel}
                  </Badge>
                </div>
                <h2 className="text-lg font-black uppercase text-slate-900 dark:text-white">
                  {topic || `Grade ${classLevel} Curriculum`}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Answered:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {filledAnswersCount} / {questions.length}
                  </strong>
                </span>
                <button
                  onClick={resetTest}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 rounded-none text-xs font-black uppercase cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reset
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIndex) => (
                <Card
                  key={qIndex}
                  className="border border-slate-200 dark:border-slate-800 rounded-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
                >
                  <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-3 px-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 text-xs font-black flex items-center justify-center rounded-none">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        Question #{qIndex + 1}
                      </span>
                    </div>
                    {answers[qIndex] !== -1 && (
                      <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Answered
                      </span>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option, oIndex) => {
                        const isSelected = answers[qIndex] === oIndex;
                        const optionLabels = ["A", "B", "C", "D"];
                        return (
                          <button
                            key={oIndex}
                            type="button"
                            onClick={() => handleAnswerChange(qIndex, oIndex)}
                            className={`p-3.5 rounded-none border text-left flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-md"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-black border ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-400"
                                  : "bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {optionLabels[oIndex]}
                            </span>
                            <span className="text-xs font-bold leading-snug pt-0.5">
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                onClick={submitTest}
                disabled={filledAnswersCount < questions.length}
                className="w-full text-xs font-black uppercase tracking-widest py-4 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 cursor-pointer disabled:opacity-50 shadow-lg"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Submit Quiz Answers
              </Button>
            </div>
          </div>
        )}

        {isSubmitted && (
          <Card className="border border-emerald-500/50 rounded-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 text-center">
              <Trophy className="h-10 w-10 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-2xl font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Assessment Completed!
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 text-center space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-none max-w-xs mx-auto space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">
                  Final Score
                </span>
                <div className="text-5xl font-black text-amber-500 dark:text-amber-400 flex items-baseline justify-center gap-1">
                  {score}
                  <span className="text-2xl text-slate-400 dark:text-slate-500">
                    /{questions.length}
                  </span>
                </div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((score / questions.length) * 100)}% Accuracy
                </p>
              </div>

              {/* Review Answers */}
              <div className="space-y-3 max-w-2xl mx-auto text-left pt-2">
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Answer Review
                </h4>
                {questions.map((q, qIndex) => {
                  const isCorrect = answers[qIndex] === q.correctAnswer;
                  return (
                    <div
                      key={qIndex}
                      className={`p-4 border rounded-none text-xs space-y-2 ${
                        isCorrect
                          ? "border-emerald-500/40 bg-slate-50 dark:bg-slate-950"
                          : "border-red-500/40 bg-slate-50 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-200">
                          Q{qIndex + 1}: {q.question}
                        </span>
                        <span
                          className={`font-black uppercase text-[10px] px-2 py-0.5 border ${
                            isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {isCorrect ? "Correct ✓" : "Incorrect ✕"}
                        </span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-400 text-xs">
                        Correct Answer:{" "}
                        <strong className="text-slate-900 dark:text-slate-200">
                          {q.options[q.correctAnswer]}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={resetTest}
                className="mt-4 text-xs font-black uppercase tracking-wider py-4 px-8 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 cursor-pointer"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Create Another Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
