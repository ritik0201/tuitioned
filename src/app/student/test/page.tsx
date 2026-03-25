"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
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

    setIsGenerating(true);
    setError('');
    setQuestions([]);
    setAnswers([]);
    setIsSubmitted(false);

    try {
      const prompt = `Generate ${numQuestions} multiple choice questions on the topic: ${topic}. Each question should have 4 options. Return the response as a valid JSON array of objects, where each object has:
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <BrainCircuit className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold">AI Test Generator</h1>
      </div>

      {!questions.length && !isGenerating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Your Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Algebra, History, Biology"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={generateQuestions} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Generate Test'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card className="mb-8">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-lg">Generating your personalized test...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && !isSubmitted && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Test: {topic}</h2>
            <Badge variant="secondary">{questions.length} Questions</Badge>
          </div>
          {questions.map((q, qIndex) => (
            <Card key={qIndex}>
              <CardHeader>
                <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 font-medium">{q.question}</p>
                <RadioGroup
                  value={answers[qIndex]?.toString() || ''}
                  onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                >
                  {q.options.map((option, oIndex) => (
                    <FormControlLabel
                      key={oIndex}
                      value={oIndex.toString()}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <div className="flex gap-4">
            <Button onClick={submitTest} className="flex-1">
              Submit Test
            </Button>
            <Button variant="outline" onClick={resetTest}>
              Generate New Test
            </Button>
          </div>
        </div>
      )}

      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-orange-500">
              {score}/{questions.length}
            </div>
            <p className="text-lg">
              You got {score} out of {questions.length} questions correct!
            </p>
            <div className="space-y-2">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="flex items-center justify-between p-2 border rounded">
                  <span>Question {qIndex + 1}</span>
                  {answers[qIndex] === q.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
            <Button onClick={resetTest} className="mt-4">
              Take Another Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
