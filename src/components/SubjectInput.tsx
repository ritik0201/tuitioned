"use client";

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface SubjectInputProps {
  value: string[];
  onChange: (subjects: string[]) => void;
  placeholder?: string;
}

export default function SubjectInput({ value = [], onChange, placeholder = "Type subject and press Enter" }: SubjectInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const subject = inputValue.trim();
      if (subject && !value.includes(subject)) {
        onChange([...value, subject]);
        setInputValue("");
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    onChange(value.filter(subject => subject !== subjectToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((subject, index) => (
          <div key={index} className="flex items-center gap-1 bg-blue-500/20 text-blue-200 border border-blue-500/50 px-3 py-1 rounded-full text-sm">
            <span>{subject}</span>
            <button
              type="button"
              onClick={() => removeSubject(subject)}
              className="hover:text-white focus:outline-none transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : "Add another subject..."}
        className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
      />
      <p className="text-xs text-gray-400 mt-1">Press Enter to add a subject</p>
    </div>
  );
}