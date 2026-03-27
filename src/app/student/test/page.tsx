"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BrainCircuit, CheckCircle, XCircle, Rocket, Sparkles, BookOpen, GraduationCap, Hash, Trophy, RotateCcw, Star, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

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
      setError('Please enter a topic');
      return;
    }
    if (!classLevel) {
      setError('Please select a class level');
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
        const parsedQuestions = JSON.parse(data.text);
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          setAnswers(new Array(parsedQuestions.length).fill(-1));
        } else {
          setError('Failed to generate questions. Please try again.');
        }
      } else {
        setError('Failed to generate questions. Please try again.');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 font-sans selection:bg-cyan-500/30">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Playful Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-900 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-[4px_4px_0px_rgba(99,102,241,1)] sm:shadow-[8px_8px_0px_rgba(99,102,241,1)] border-4 border-indigo-500 transform hover:-translate-y-1 transition-transform relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="p-3 sm:p-4 bg-indigo-500/20 rounded-full border-2 border-indigo-400">
             <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 tracking-tight text-center sm:text-left">
            Academic Assessment
          </h1>
        </div>

        {!questions.length && !isGenerating && (
          <Card className="border-4 border-cyan-500 shadow-[8px_8px_0px_rgba(6,182,212,1)] rounded-[2rem] bg-slate-900 overflow-hidden relative">
            <CardHeader className="relative z-10 border-b-4 border-dashed border-slate-800 pb-6 bg-slate-900/50">
              <CardTitle className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-cyan-400" />
                Create Your Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 relative z-10">
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-xl font-bold text-purple-400 flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" /> What do you want to learn?
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Animals, Space, Math"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="classLevel" className="text-xl font-bold text-green-400 flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5" /> Grade Level
                  </Label>
                  <Select value={classLevel} onValueChange={setClassLevel}>
                    <SelectTrigger className="text-lg py-6 rounded-2xl border-2 border-slate-700 bg-slate-950 text-slate-100 focus:ring-green-500">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-slate-700 bg-slate-900 text-slate-100">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={`${i + 1}`} className="text-lg font-medium cursor-pointer focus:bg-slate-800 focus:text-green-400 rounded-xl m-1">
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="numQuestions" className="text-xl font-bold text-orange-400 flex items-center gap-2 mb-2">
                    <Hash className="h-5 w-5" /> Questions
                  </Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger className="text-lg py-6 rounded-2xl border-2 border-slate-700 bg-slate-950 text-slate-100 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-slate-700 bg-slate-900 text-slate-100">
                      <SelectItem value="5" className="text-lg font-medium cursor-pointer focus:bg-slate-800 focus:text-orange-400 rounded-xl m-1">5 Questions</SelectItem>
                      <SelectItem value="10" className="text-lg font-medium cursor-pointer focus:bg-slate-800 focus:text-orange-400 rounded-xl m-1">10 Questions</SelectItem>
                      <SelectItem value="15" className="text-lg font-medium cursor-pointer focus:bg-slate-800 focus:text-orange-400 rounded-xl m-1">15 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="rounded-2xl border-2 border-red-500/50 bg-red-950/50">
                  <AlertDescription className="text-red-400 font-bold text-lg">{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={generateQuestions} 
                disabled={isGenerating} 
                className="w-full text-xl py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_8px_0_rgba(67,56,202,1)] hover:shadow-[0_4px_0_rgba(67,56,202,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-indigo-400 mt-4"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Preparing your quiz...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">Start Quiz <ArrowRight className="h-6 w-6 ml-2" /></span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
           <Card className="border-4 border-yellow-500 shadow-[8px_8px_0px_rgba(202,138,4,1)] rounded-[2rem] bg-slate-900 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 max-w-full max-h-full rounded-full animate-ping bg-yellow-500/20 opacity-75"></div>
                <div className="relative bg-slate-950 p-6 rounded-full border-4 border-yellow-500/50">
                  <BrainCircuit className="h-12 w-12 animate-pulse text-yellow-400" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold text-cyan-400">Generating Questions...</h3>
                <p className="text-lg text-slate-400 font-medium">Please wait while we prepare your assessment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && !isSubmitted && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-4 rounded-3xl shadow-[4px_4px_0_rgba(6,182,212,1)] border-4 border-cyan-500">
              <h2 className="text-2xl font-extrabold text-slate-200 flex items-center gap-2">
                <Target className="h-6 w-6 text-cyan-400" /> 
                Subject: <span className="text-indigo-400">{topic}</span>
              </h2>
              <Badge variant="secondary" className="text-lg py-1 px-4 rounded-full bg-slate-800 text-yellow-400 border-2 border-yellow-500/50 flex gap-2 items-center">
                <Star className="h-4 w-4 fill-yellow-400" /> {questions.length} Questions
              </Badge>
            </div>
            
            <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="border-4 border-indigo-500/50 shadow-[8px_8px_0px_rgba(99,102,241,0.2)] rounded-[2rem] bg-slate-900 overflow-hidden hover:border-indigo-400 transition-colors">
                <CardHeader className="bg-slate-950/50 border-b-4 border-dashed border-slate-800">
                  <CardTitle className="text-xl font-bold text-indigo-400 flex items-center gap-3">
                    <span className="flex items-center justify-center bg-indigo-500/20 text-indigo-300 w-10 h-10 rounded-full border-2 border-indigo-500/50">
                      {qIndex + 1}
                    </span>
                    Question Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="mb-6 text-xl font-bold text-slate-200 leading-relaxed">{q.question}</p>
                  <RadioGroup
                    value={answers[qIndex]?.toString() || ''}
                    onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {q.options.map((option, oIndex) => {
                      const isSelected = answers[qIndex] === oIndex;
                      return (
                        <div key={oIndex} className={`relative rounded-2xl border-2 transition-all overflow-hidden ${isSelected ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-700 bg-slate-950/50 hover:border-slate-500'}`}>
                          <FormControlLabel
                            className="w-full h-full m-0 p-4"
                            value={oIndex.toString()}
                            control={<Radio sx={{ color: '#64748b', '&.Mui-checked': { color: '#22d3ee' } }} />}
                            label={<span className={`text-lg font-bold ml-2 ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>{option}</span>}
                          />
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Button 
                onClick={submitTest} 
                className="flex-1 text-2xl py-8 rounded-[2rem] bg-green-600 hover:bg-green-500 text-white font-bold shadow-[0_8px_0_rgba(22,163,74,1)] hover:shadow-[0_4px_0_rgba(22,163,74,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-green-400"
              >
                <CheckCircle className="mr-3 h-6 w-6" /> Submit Answers
              </Button>
              <Button 
                variant="outline" 
                onClick={resetTest}
                className="text-xl py-8 px-8 rounded-[2rem] border-4 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold shadow-[0_8px_0_rgba(51,65,85,1)] hover:shadow-[0_4px_0_rgba(51,65,85,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Start Over
              </Button>
            </div>
          </div>
        )}

        {isSubmitted && (
          <Card className="border-4 border-green-500 shadow-[8px_8px_0px_rgba(34,197,94,1)] rounded-[2rem] bg-slate-900 overflow-hidden relative">
            <CardHeader className="bg-slate-950/50 border-b-4 border-dashed border-slate-800 pt-8 pb-6">
              <CardTitle className="text-center text-4xl font-extrabold text-green-400 flex justify-center items-center gap-3">
                <Trophy className="h-10 w-10 text-yellow-400" /> Assessment Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8 pt-8">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-lg flex items-baseline justify-center gap-2">
                  {score}<span className="text-4xl text-slate-500">/{questions.length}</span>
                </div>
              </div>
              
              <div className="bg-indigo-950/50 p-6 rounded-3xl border-2 border-indigo-500/30 inline-block">
                <p className="text-2xl font-bold text-indigo-300">
                  {score === questions.length ? "Excellent! Perfect Score!" : 
                   score >= questions.length / 2 ? "Good Job! Keep it up!" : 
                   "Keep practicing to improve your score!"}
                </p>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto text-left mt-8">
                <h4 className="text-2xl font-bold text-slate-300 mb-6 flex items-center justify-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-400" /> Let's check your answers
                </h4>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className={`flex flex-col sm:flex-row items-center justify-between p-5 border-2 rounded-[1.5rem] gap-4 ${answers[qIndex] === q.correctAnswer ? 'border-green-500/50 bg-green-950/20' : 'border-red-500/50 bg-red-950/20'}`}>
                    <div className="flex-1">
                      <span className="font-bold text-lg text-slate-200 block mb-2 flex items-center gap-2">
                        Question {qIndex + 1}: {answers[qIndex] === q.correctAnswer ? <span className="text-green-400">Correct!</span> : <span className="text-red-400">Incorrect!</span>}
                      </span>
                      <div className="text-slate-400 font-medium">
                        <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Correct Answer:</span>
                        <span className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 inline-block">
                          {q.options[q.correctAnswer]}
                        </span>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 p-3 rounded-full border-2 ${answers[qIndex] === q.correctAnswer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      {answers[qIndex] === q.correctAnswer ? (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={resetTest} 
                className="mt-10 text-xl py-8 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_8px_0_rgba(67,56,202,1)] hover:shadow-[0_4px_0_rgba(67,56,202,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-indigo-400"
              >
                <RotateCcw className="mr-2 h-6 w-6" /> Take Another Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}