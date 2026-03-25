"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { X, Send, Bot, User, Loader2, Sparkles, LayoutDashboard, LogIn, BookOpen } from "lucide-react";

interface Message {
    role: "user" | "ai";
    content: string;
}

const GeminiAI: React.FC = () => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Hey there, smarty-pants! I'm Ed, your learning buddy. Ask me anything about our fun classes! ✨" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map((m) => ({
                        role: m.role === "user" ? "user" : "model",
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();
            if (data.text) {
                setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
            } else {
                setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "ai", content: "Failed to connect to AI. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-end gap-4"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`p-3.5 rounded-full border transition-all flex items-center gap-3 shadow-2xl ${isOpen
                    ? "bg-orange-500 text-white border-orange-400 shadow-orange-500/20"
                    : "bg-zinc-900/90 backdrop-blur-md border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 hover:scale-105"
                    }`}
            >
                <Bot size={22} className={isOpen ? "animate-bounce" : "group-hover:rotate-12 transition-transform"} />
                <span className={`font-bold text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0 sm:max-w-[100px] sm:opacity-100"}`}>
                    Your Buddy, Ed!
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, x: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, x: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-[320px] sm:w-[380px] h-[500px] bg-[#0d0d0d] border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                                    <Bot className="text-orange-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-bold tracking-tight">Ed, your Learning Buddy</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest">Online</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-3 bg-zinc-900/30 border-b border-zinc-800 grid grid-cols-2 gap-2.5">
                            {session ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 hover:text-white transition-all border border-zinc-700/80 hover:border-orange-500/50 group shadow-sm hover:shadow-md hover:shadow-orange-500/10"
                                    >
                                        <LayoutDashboard size={14} className="text-zinc-400 group-hover:text-orange-400 transition-colors" /> Dashboard
                                    </Link>
                                    <Link
                                        href="/student/courses"
                                        className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 hover:text-white transition-all border border-zinc-700/80 hover:border-orange-500/50 group shadow-sm hover:shadow-md hover:shadow-orange-500/10"
                                    >
                                        <BookOpen size={14} className="text-zinc-400 group-hover:text-orange-400 transition-colors" /> My Courses
                                    </Link>
                                    <Link
                                        href="/get-a-free-trial"
                                        className="col-span-2 flex items-center justify-center gap-2 p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-xs font-semibold text-yellow-300 hover:text-yellow-200 transition-all border border-yellow-500/30 hover:border-yellow-500/50 group shadow-sm hover:shadow-md hover:shadow-yellow-500/10"
                                    >
                                        <Sparkles size={14} className="text-yellow-500 group-hover:text-yellow-400 transition-colors" /> Get a Free Trial
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/student-login" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 hover:text-white transition-all border border-zinc-700/80 hover:border-orange-500/50 group shadow-sm hover:shadow-md hover:shadow-orange-500/10">
                                        <LogIn size={14} className="text-zinc-400 group-hover:text-orange-400 transition-colors" /> Student Login
                                    </Link>
                                    <Link href="/get-a-free-trial" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-xs font-semibold text-yellow-300 hover:text-yellow-200 transition-all border border-yellow-500/30 hover:border-yellow-500/50 group shadow-sm hover:shadow-md hover:shadow-yellow-500/10">
                                        <Sparkles size={14} className="text-yellow-500 group-hover:text-yellow-400 transition-colors" /> Free Trial
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-linear-to-b from-zinc-950/20 to-black/40">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-3xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-orange-500 text-white rounded-br-lg"
                                            : "bg-zinc-800 text-zinc-200 rounded-bl-lg"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                            {msg.role === "ai" ? <Bot size={12} className="text-orange-400" /> : <User size={12} />}
                                            <span className="text-[9px] font-black uppercase tracking-tighter">
                                                {msg.role === "ai" ? "Ed" : session?.user?.fullName || "You"}
                                            </span>
                                        </div>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                code: ({ children }) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 text-xs">{children}</code>,
                                                pre: ({ children }) => <pre className="bg-zinc-800 p-2 rounded mb-2 overflow-x-auto">{children}</pre>,
                                                a: ({ node, ...props }) => (
                                                    <Link
                                                        {...props}
                                                        href={props.href ?? '#'}
                                                        className="inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded-lg mt-2 hover:bg-orange-600 transition-colors text-center"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />),
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-900/50 p-3 rounded-2xl rounded-tl-none border border-zinc-800 flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Thinking</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask me a question... 🚀"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:hover:bg-orange-500 text-white rounded-lg transition-all shadow-lg active:scale-95"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Sparkles size={10} className="text-zinc-500" />
                                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest text-center">
                                    TuitionEd AI Assistant
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeminiAI;