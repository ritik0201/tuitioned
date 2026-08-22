"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Rocket, Sparkles, BookOpen, GraduationCap, Hash, Trophy, RotateCcw, Star, Target, Lightbulb, ArrowRight, Zap, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const TOPIC_SUGGESTIONS = [
  { label: '📐 Mathematics', value: 'Mathematics & Algebra' },
  { label: '🪐 Solar System', value: 'Astronomy & Solar System' },
  { label: '🐍 Python Coding', value: 'Python Programming Basics' },
  { label: '📚 English Grammar', value: 'English Grammar & Vocabulary' },
  { label: '🧪 Chemistry Lab', value: 'Chemistry Elements & Reactions' },
  { label: '⚡ Physics Motion', value: 'Laws of Physics & Motion' }
];

export default function TestPage() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [classLevel, setClassLevel] = useState('10');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter or select a quiz topic');
      return;
    }
    if (!classLevel) {
      setError('Please select a grade level');
      return;
    }

    setIsGenerating(true);
    setError('');
    setQuestions([]);
    setAnswers([]);
    setIsSubmitted(false);

    try {
      const prompt = `Generate ${numQuestions} multiple choice questions for a grade ${classLevel} student on the topic: ${topic}. Each question should have 4 options. Return the response as a valid JSON array of objects, where each object has:
- "question": string
- "options": array of 4 strings
- "correctAnswer": number (0-3 index of the correct option)

Do not include any other text, just the JSON array.`;

      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
        }),
      });

      const data = await response.json();
      if (data.text) {
        const cleanText = data.text.replace(/```json\n?|```/g, "").trim();
        try {
          const parsedQuestions = JSON.parse(cleanText);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            setAnswers(new Array(parsedQuestions.length).fill(-1));
          } else {
            setError('Failed to generate questions. The AI returned an unexpected format.');
          }
        } catch (parseErr) {
          console.error('Error parsing AI response:', parseErr);
          setError('Failed to understand the AI response. Please try again.');
        }
      } else {
        setError(data.error || 'Failed to generate questions. Please try again.');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('An error occurred while generating questions.');
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
    setError('');
  };

  const filledAnswersCount = answers.filter(a => a !== -1).length;

  return (
    <div className="w-full bg-slate-950 text-slate-100 py-4 px-2 font-sans select-none">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-none shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 border border-indigo-500/40 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-none">
              <Zap className="h-3 w-3 text-yellow-400" />
              AI Quiz Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Academic Assessment
            </h1>
            <p className="text-xs text-slate-400 font-medium">Generate instant quizzes for any grade or topic!</p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Badge className="px-3 py-1.5 rounded-none font-black text-xs uppercase bg-slate-950 text-slate-300 border border-slate-800">
              Grade {classLevel}
            </Badge>
            <Badge className="px-3 py-1.5 rounded-none font-black text-xs uppercase bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              {numQuestions} Questions
            </Badge>
          </div>
        </div>

        {!questions.length && !isGenerating && (
          <Card className="border border-slate-800 rounded-none bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-950 border-b border-slate-800 py-4 px-6">
              <CardTitle className="text-lg font-black uppercase text-indigo-400 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Configure Quiz
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Topic Input */}
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" /> Enter Topic or Subject
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g. Linear Equations, Solar System, Python Loops..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-sm font-bold py-3 px-4 rounded-none border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                />

                {/* Quick Topic Chips */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_SUGGESTIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTopic(chip.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-none border transition-all cursor-pointer ${
                          topic === chip.value
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classLevel" className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-400" /> Target Grade
                  </Label>
                  <Select value={classLevel} onValueChange={setClassLevel}>
                    <SelectTrigger className="text-xs font-bold py-3 rounded-none border border-slate-800 bg-slate-950 text-slate-100">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-slate-800 bg-slate-900 text-slate-100">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={`${i + 1}`} className="text-xs font-bold cursor-pointer rounded-none">
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numQuestions" className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-amber-400" /> Number of Questions
                  </Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger className="text-xs font-bold py-3 rounded-none border border-slate-800 bg-slate-950 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-slate-800 bg-slate-900 text-slate-100">
                      <SelectItem value="5" className="text-xs font-bold cursor-pointer rounded-none">5 Questions (Quick)</SelectItem>
                      <SelectItem value="10" className="text-xs font-bold cursor-pointer rounded-none">10 Questions (Standard)</SelectItem>
                      <SelectItem value="15" className="text-xs font-bold cursor-pointer rounded-none">15 Questions (Challenge)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-none border border-red-500/50 bg-red-950/50">
                  <AlertDescription className="text-red-400 font-bold text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={generateQuestions} 
                disabled={isGenerating} 
                className="w-full text-xs font-black uppercase tracking-widest py-4 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-400 cursor-pointer shadow-lg mt-2"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Generating Quiz...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ⚡ Generate Custom Quiz <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="border border-indigo-500/50 rounded-none bg-slate-900 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <Sparkles className="h-12 w-12 animate-pulse text-indigo-400" />
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-black uppercase text-white tracking-wider">Crafting Questions with AI...</h3>
                <p className="text-xs text-slate-400 font-medium">Analyzing {topic} for Grade {classLevel} assessment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && !isSubmitted && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-none border border-slate-800 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Active Quiz</span>
                <h2 className="text-lg font-black uppercase text-white">{topic}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">
                  Answered: <strong className="text-indigo-400">{filledAnswersCount} / {questions.length}</strong>
                </span>
                <button
                  onClick={resetTest}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-none text-xs font-black uppercase cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reset
                </button>
              </div>
            </div>
            
            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIndex) => (
                <Card key={qIndex} className="border border-slate-800 rounded-none bg-slate-900 shadow-md overflow-hidden">
                  <CardHeader className="bg-slate-950 border-b border-slate-800 py-3 px-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-950 border border-indigo-500/50 text-indigo-400 text-xs font-black flex items-center justify-center rounded-none">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Question #{qIndex + 1}</span>
                    </div>
                    {answers[qIndex] !== -1 && (
                      <span className="text-[10px] font-black uppercase text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Answered
                      </span>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <p className="text-sm font-bold text-slate-100 leading-snug">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option, oIndex) => {
                        const isSelected = answers[qIndex] === oIndex;
                        const optionLabels = ['A', 'B', 'C', 'D'];
                        return (
                          <button
                            key={oIndex}
                            type="button"
                            onClick={() => handleAnswerChange(qIndex, oIndex)}
                            className={`p-3.5 rounded-none border text-left flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-indigo-400 bg-indigo-950/40 text-white shadow-md'
                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:bg-slate-950'
                            }`}
                          >
                            <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-black border ${
                              isSelected ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}>
                              {optionLabels[oIndex]}
                            </span>
                            <span className="text-xs font-bold leading-snug pt-0.5">{option}</span>
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
          <Card className="border border-emerald-500/50 rounded-none bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-950 border-b border-slate-800 py-6 text-center">
              <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-2xl font-black uppercase text-emerald-400 tracking-wider">
                Assessment Completed!
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 text-center space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-none max-w-xs mx-auto space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Final Score</span>
                <div className="text-5xl font-black text-amber-400 flex items-baseline justify-center gap-1">
                  {score}<span className="text-2xl text-slate-500">/{questions.length}</span>
                </div>
                <p className="text-xs font-bold text-emerald-400">
                  {Math.round((score / questions.length) * 100)}% Accuracy
                </p>
              </div>

              {/* Review Answers */}
              <div className="space-y-3 max-w-2xl mx-auto text-left pt-2">
                <h4 className="text-xs font-black uppercase text-slate-300 flex items-center justify-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" /> Answer Review
                </h4>
                {questions.map((q, qIndex) => {
                  const isCorrect = answers[qIndex] === q.correctAnswer;
                  return (
                    <div key={qIndex} className={`p-4 border rounded-none text-xs space-y-2 ${isCorrect ? 'border-emerald-500/40 bg-slate-950' : 'border-red-500/40 bg-slate-950'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          Q{qIndex + 1}: {q.question}
                        </span>
                        <span className={`font-black uppercase text-[10px] px-2 py-0.5 border ${isCorrect ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'}`}>
                          {isCorrect ? 'Correct ✓' : 'Incorrect ✕'}
                        </span>
                      </div>

                      <div className="text-slate-400 text-xs">
                        Correct Answer: <strong className="text-slate-200">{q.options[q.correctAnswer]}</strong>
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