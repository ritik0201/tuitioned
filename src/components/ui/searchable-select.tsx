"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(query)) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-[#1f2937] px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-gray-400"
        )}
      >
        <span className="truncate text-left font-normal">
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-white truncate">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs text-gray-400 truncate hidden sm:inline">
                  ({selectedOption.sublabel})
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ml-2"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden rounded-md border border-gray-700 bg-[#111827] text-white shadow-2xl animate-in fade-in-80 zoom-in-95">
          {/* Search Header */}
          <div className="flex items-center border-b border-gray-700 px-3 py-2 bg-[#1f2937]">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-8 w-full rounded-md bg-transparent text-sm text-white outline-none placeholder:text-gray-400 font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400 font-normal">
                Loading options...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400 font-normal">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm font-normal text-gray-200 outline-none transition-colors hover:bg-blue-600 hover:text-white",
                      isSelected && "bg-blue-600 text-white font-normal"
                    )}
                  >
                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border border-gray-600 bg-gray-800 text-gray-300 group-hover:bg-blue-700 group-hover:text-white">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <div className="text-xs text-gray-400 group-hover:text-gray-200 truncate mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-white" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
