"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  ListItemIcon,
  ListItemText,
  Checkbox,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Send,
  Mail,
  Users,
  Info,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  UserPlus,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Play,
  Pause,
  Square,
  Sparkles,
  RefreshCw,
  Palette,
  Eye,
  Link2,
  Image,
  Search,
  FileCode
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

// Presets definition for email templates
const templates = {
  custom: {
    subject: '',
    message: '',
    accentColor: '#6366f1',
    bgColor: '#f3f4f6',
    textColor: '#1f2937',
    logoUrl: 'https://tuition-ed.com/wp-content/uploads/2025/05/cropped-Tuitioned-logo-1.png',
    buttonLink: '',
    buttonText: '',
    buttonLink2: '',
    buttonText2: ''
  },
  summer: {
    subject: '☀️ Special Summer Class Offer: Boost Your Skills with TuitionEd!',
    message: `<p>Dear [Name],</p>
<p>Summer is here — and it's the perfect time to keep your child engaged, curious, and ahead of the curve. Tuitioned's Online Summer Camps 2026 bring expert-led, live interactive classes directly to your child's screen, in Coding, Math, STEM, Chess, Art, Music, Languages, and more. Small batches. Real teachers. Real results.</p>

<div style="background-color: #f9fafb; border-radius: 8px; padding: 12px 6px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
  <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 12px; text-align: center; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Tuitioned by the Numbers</h3>
  <div class="resp-stat" style="display: inline-block; width: 72px; height: 72px; margin: 4px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; vertical-align: top; box-sizing: border-box; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 8px; font-family: sans-serif;">4.9/5</div>
    <div style="font-size: 8px; color: #6b7280; margin-top: 4px; line-height: 1.2; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Rating</div>
  </div>
  <div class="resp-stat" style="display: inline-block; width: 72px; height: 72px; margin: 4px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; vertical-align: top; box-sizing: border-box; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 8px; font-family: sans-serif;">315+</div>
    <div style="font-size: 8px; color: #6b7280; margin-top: 4px; line-height: 1.2; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Tutors</div>
  </div>
  <div class="resp-stat" style="display: inline-block; width: 72px; height: 72px; margin: 4px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; vertical-align: top; box-sizing: border-box; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 8px; font-family: sans-serif;">8+</div>
    <div style="font-size: 8px; color: #6b7280; margin-top: 4px; line-height: 1.2; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Camps</div>
  </div>
  <div class="resp-stat" style="display: inline-block; width: 72px; height: 72px; margin: 4px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; vertical-align: top; box-sizing: border-box; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 8px; font-family: sans-serif;">10+</div>
    <div style="font-size: 8px; color: #6b7280; margin-top: 4px; line-height: 1.2; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Countries</div>
  </div>
</div>

<div style="margin: 24px 0;">
  <h3 style="color: #111827; font-size: 15px; margin-bottom: 12px; border-left: 4px solid #f59e0b; padding-left: 10px; font-weight: 800; font-family: sans-serif;">Why Parents Worldwide Choose Us</h3>
  <ul style="list-style-type: none; padding-left: 0; margin: 0; line-height: 1.6; font-size: 13px; font-family: sans-serif;">
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> 100% live & interactive classes — never pre-recorded
    </li>
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> Small batches of only 8–12 students for personalized attention
    </li>
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> Expert international faculty with global curriculum standards
    </li>
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> Flexible timings across US, UK, Europe, Asia, Australia & Middle East
    </li>
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> Official certificate of completion for every child
    </li>
    <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
      <span style="color: #10b981; position: absolute; left: 0; font-weight: bold;">✔</span> Parent dashboard to track attendance & progress anytime
    </li>
  </ul>
</div>

<div style="margin: 24px 0; text-align: center;">
  <h3 style="color: #111827; font-size: 15px; margin-bottom: 16px; border-left: 4px solid #f59e0b; padding-left: 10px; font-weight: 800; text-align: left; font-family: sans-serif;">Our Summer Camp Programs</h3>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">💻</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Coding Camp</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 6–15</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">Scratch, Python, and Web Development.</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">➕</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Math & Reading</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 5–14</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">Advanced Math, Phonics, Comprehension.</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">🔬</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">STEM Camp</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 8–15</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">Science experiments, AI, and Engineering.</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">♟️</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Chess Camp</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 6–14</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">Tactics, strategy, and chess puzzles.</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">🎨</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Art & Creative</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 5–12</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">Drawing, painting, and digital design.</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 18px; margin-bottom: 4px;">🌐</div>
    <div style="font-weight: 800; color: #111827; font-size: 11px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Languages Camp</div>
    <div style="font-size: 8px; color: #f59e0b; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Ages 7–15</div>
    <div style="color: #4b5563; font-size: 8.5px; line-height: 1.35; font-family: sans-serif;">English, French, Spanish, Japanese.</div>
  </div>
</div>

<div style="margin: 24px 0; padding: 12px 6px; background-color: #fcfcfc; border-radius: 8px; border: 1px dashed #e5e7eb; text-align: center;">
  <h3 style="color: #111827; font-size: 15px; margin-top: 0; margin-bottom: 12px; text-align: center; font-weight: 800; font-family: sans-serif;">How It Works</h3>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">1</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Choose Camp</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Pick child's favorite topic.</div>
  </div>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">2</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Book Trial</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Schedule a free trial class.</div>
  </div>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">3</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Join Live</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Attend live interactive sessions.</div>
  </div>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">4</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Track stats</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Track stats on dashboard.</div>
  </div>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">5</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Get Certificate</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Earn certificate of completion.</div>
  </div>
  <div class="resp-step-sq" style="display: inline-block; width: 82px; height: 82px; margin: 5px; padding: 8px 6px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; text-align: center; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="display: inline-block; width: 16px; height: 16px; line-height: 16px; border-radius: 50%; background-color: #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; margin-bottom: 4px; font-family: sans-serif;">6</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; margin-bottom: 2px;">Celebrate!</div>
    <div style="color: #6b7280; font-size: 7.5px; line-height: 1.25; font-family: sans-serif;">Celebrate their achievements!</div>
  </div>
</div>

<div style="margin: 20px 0; font-size: 13px; line-height: 1.5; font-family: sans-serif;">
  <div style="margin-bottom: 10px; padding: 10px; background-color: #f0fdf4; border-radius: 6px; color: #166534; border: 1px solid #bbf7d0;">
    <strong>🎓 Free Trial Class Available!</strong> Book a free demo class — see the quality yourself before enrolling.
  </div>
  <div style="padding: 10px; background-color: #fffbeb; border-radius: 6px; color: #854d0e; border: 1px solid #fef3c7;">
    <strong>🎁 Early Bird Discount — Save 30%!</strong> Limited seats per batch. Lock in best price for Summer 2026.
  </div>
</div>

<div style="margin: 28px 0; text-align: center;">
  <h3 style="color: #111827; font-size: 15px; margin-bottom: 16px; border-left: 4px solid #f59e0b; padding-left: 10px; font-weight: 800; text-align: left; font-family: sans-serif;">What Parents Are Saying</h3>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="color: #f59e0b; font-size: 8px; margin-bottom: 4px;">★★★★★</div>
    <div style="font-style: italic; color: #4b5563; font-size: 8px; line-height: 1.3; height: 58px; overflow: hidden; font-family: sans-serif; margin-bottom: 4px;">"Loved coding camp! Gained so much confidence."</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Emma Thompson</div>
    <div style="font-size: 7.5px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">London, UK</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="color: #f59e0b; font-size: 8px; margin-bottom: 4px;">★★★★★</div>
    <div style="font-style: italic; color: #4b5563; font-size: 8px; line-height: 1.3; height: 58px; overflow: hidden; font-family: sans-serif; margin-bottom: 4px;">"Math program was game changer. Improved grades!"</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Michael Chen</div>
    <div style="font-size: 7.5px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">New York, USA</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="color: #f59e0b; font-size: 8px; margin-bottom: 4px;">★★★★★</div>
    <div style="font-style: italic; color: #4b5563; font-size: 8px; line-height: 1.3; height: 58px; overflow: hidden; font-family: sans-serif; margin-bottom: 4px;">"STEM camp was amazing. Perfect class timings."</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Sarah Patel</div>
    <div style="font-size: 7.5px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Sydney, Australia</div>
  </div>
  
  <div class="resp-card-sq" style="display: inline-block; width: 130px; height: 130px; margin: 6px; text-align: left; background-color: #ffffff; border-radius: 8px; padding: 12px 10px; border: 1px solid #e5e7eb; vertical-align: top; box-sizing: border-box; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="color: #f59e0b; font-size: 8px; margin-bottom: 4px;">★★★★★</div>
    <div style="font-style: italic; color: #4b5563; font-size: 8px; line-height: 1.3; height: 58px; overflow: hidden; font-family: sans-serif; margin-bottom: 4px;">"Chess camp helped boost rating significantly."</div>
    <div style="font-weight: 800; color: #111827; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Ahmed Al-Mansour</div>
    <div style="font-size: 7.5px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif;">Dubai, UAE</div>
  </div>
</div>

<p style="font-size: 13px; line-height: 1.5; font-family: sans-serif;">Have questions about which program suits your child? Reply to this email or reach us at <a href="mailto:contact@tuition-ed.com" style="color: #f59e0b; text-decoration: underline;">contact@tuition-ed.com</a> or call +91 9211493190. Our team is available across all time zones.</p>
<p style="font-size: 13px; line-height: 1.5; font-family: sans-serif;">We can't wait to see your child learn, grow, and shine this summer! 🌟</p>
<p style="margin-bottom: 0; font-size: 13px; line-height: 1.5; font-family: sans-serif;">Warm regards,<br />
<strong>The Tuitioned Team</strong><br />
<span style="font-size: 11px; color: #6b7280;">Your Child's Learning Partner · tuition-ed.com</span></p>`,
    accentColor: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#1f2937',
    logoUrl: 'https://tuition-ed.com/wp-content/uploads/2025/05/cropped-Tuitioned-logo-1.png',
    buttonLink: 'https://tuition-ed.com/online-summer-camp/',
    buttonText: 'Book Free Trial',
    buttonLink2: 'https://tuition-ed.com/online-summer-camp/',
    buttonText2: 'Read More'
  },
  festival: {
    subject: '🎉 Celebrating Together: Warm Wishes and Festive Offers from TuitionEd!',
    message: `Dear [Name],

As the festive season brings warmth, joy, and light into our lives, the entire team at TuitionEd wants to extend our warmest wishes to you and your loved ones!

To celebrate this special time, we want to help you take the next step in your educational journey. We are offering exciting promotional discounts on all our premium tutoring packages.

Let's make this season of celebration a milestone for your learning and growth. Click the link below to view your festive offers!`,
    accentColor: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#1f2937',
    logoUrl: 'https://tuition-ed.com/wp-content/uploads/2025/05/cropped-Tuitioned-logo-1.png',
    buttonLink: '/offers',
    buttonText: 'Get Festive Offer',
    buttonLink2: '',
    buttonText2: ''
  }
};

const recipientGroups = [
  { value: 'all', label: 'All Users', icon: <Users size={18} />, color: '#6366f1' },
  { value: 'student', label: 'All Students', icon: <GraduationCap size={18} />, color: '#3b82f6' },
  { value: 'approved_student', label: 'Approved Students', icon: <ShieldCheck size={18} />, color: '#10b981' },
  { value: 'teacher', label: 'All Teachers', icon: <Users size={18} />, color: '#f59e0b' },
  { value: 'approved_teacher', label: 'Approved Teachers', icon: <UserCheck size={18} />, color: '#8b5cf6' },
  { value: 'pending_teacher', label: 'Pending Teachers', icon: <AlertCircle size={18} />, color: '#ef4444' },
  { value: 'signup', label: 'Unverified Users', icon: <UserPlus size={18} />, color: '#ec4899' },
];

const textfieldStyles = {
  bgcolor: 'rgba(255, 255, 255, 0.03)',
  '& .MuiOutlinedInput-root': { borderRadius: 3 },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  '& .MuiOutlinedInput-input': { color: 'white', fontWeight: 500 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
};

export default function BulkMailPage() {
  const [recipientType, setRecipientType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Recipients loaded & checklist states
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Branding Customization States
  const [templateType, setTemplateType] = useState<'custom' | 'summer' | 'festival'>('custom');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [textColor, setTextColor] = useState('#1f2937');
  const [logoUrl, setLogoUrl] = useState('https://tuition-ed.com/wp-content/uploads/2025/05/cropped-Tuitioned-logo-1.png');
  const [buttonLink, setButtonLink] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink2, setButtonLink2] = useState('');
  const [buttonText2, setButtonText2] = useState('');

  // Client-side queue sending states
  const [queueRunning, setQueueRunning] = useState(false);
  const [queuePaused, setQueuePaused] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueLog, setQueueLog] = useState<any[]>([]);
  const [queueSuccessCount, setQueueSuccessCount] = useState(0);
  const [queueFailedCount, setQueueFailedCount] = useState(0);

  // Preview options
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewHtml, setPreviewHtml] = useState('');

  // Refs for async loops to avoid stale closures
  const queueRunningRef = useRef(false);
  const queuePausedRef = useRef(false);
  const queueIndexRef = useRef(0);
  const selectedRecipientsRef = useRef<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  // Sync selected recipients with ref
  useEffect(() => {
    selectedRecipientsRef.current = selectedRecipients;
  }, [selectedRecipients]);

  // Scroll terminal logs automatically
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [queueLog]);

  // Fetch recipients list whenever recipient group is modified
  useEffect(() => {
    const fetchRecipients = async () => {
      if (!recipientType) {
        setRecipients([]);
        setSelectedRecipients([]);
        return;
      }
      setRecipientsLoading(true);
      try {
        const res = await fetch(`/api/bulk-email?recipientType=${recipientType}`);
        const data = await res.json();
        if (data.success) {
          setRecipients(data.users || []);
          // Automatically select all initially
          setSelectedRecipients((data.users || []).map((u: any) => u.email));
        } else {
          toast.error(data.message || 'Failed to fetch recipients list');
        }
      } catch (err) {
        console.error('Error fetching recipients:', err);
        toast.error('Error fetching recipients list');
      } finally {
        setRecipientsLoading(false);
      }
    };

    fetchRecipients();
  }, [recipientType]);

  // Update live preview document in real-time
  useEffect(() => {
    setPreviewHtml(compileHtml('John Doe'));
  }, [templateType, subject, message, accentColor, bgColor, textColor, logoUrl, buttonLink, buttonText, buttonLink2, buttonText2]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/bulk-email/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleApplyTemplate = (type: 'custom' | 'summer' | 'festival') => {
    const preset = templates[type];
    setTemplateType(type);
    setSubject(preset.subject);
    setMessage(preset.message);
    setAccentColor(preset.accentColor);
    setBgColor(preset.bgColor);
    setTextColor(preset.textColor);
    setLogoUrl(preset.logoUrl);
    setButtonLink(preset.buttonLink);
    setButtonText(preset.buttonText);
    setButtonLink2(preset.buttonLink2 || '');
    setButtonText2(preset.buttonText2 || '');
    toast.success(`Applied preset: ${type === 'custom' ? 'Custom Layout' : type === 'summer' ? 'Summer Class Offer' : 'Festival Greeting'}`);
  };

  const compileHtml = (name: string = '[Name]') => {
    // Check if the message contains HTML tags
    const isHtml = /<[a-z][\s\S]*>/i.test(message);

    let htmlContent = message;
    if (!isHtml) {
      // Plain text gets newlines replaced with <br />
      htmlContent = message.replace(/\n/g, '<br />');
    } else {
      // HTML template: clean up spacing and newlines between tags to support inline-block flow perfectly
      htmlContent = message.replace(/>\s+</g, '><');
    }

    if (templateType === 'custom') {
      return `<div style="font-family: 'Inter', sans-serif; line-height: 1.6; color: ${textColor}; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
           ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height: 40px;" />` : `<h1 style="color: ${accentColor}; margin: 0; font-family: sans-serif;">TuitionEd</h1>`}
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
          ${htmlContent.replace(/\[Name\]/g, name)}
        </div>
        <div style="margin-top: 24px; text-align: center;">
          ${buttonLink ? `
            <a href="${buttonLink}" target="_blank" style="background-color: ${accentColor}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin: 6px;">
              ${buttonText || 'Learn More'}
            </a>
          ` : ''}
          ${buttonLink2 ? `
            <a href="${buttonLink2}" target="_blank" style="background-color: transparent; color: ${accentColor}; border: 2px solid ${accentColor}; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin: 6px;">
              ${buttonText2 || 'Read More'}
            </a>
          ` : ''}
        </div>
        <div style="margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated email from TuitionEd Admin. Please do not reply.
        </div>
      </div>`;
    }

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .outer-wrap { padding: 12px 4px !important; }
            .inner-wrap { border-radius: 6px !important; }
            .hdr-banner { padding: 20px 10px !important; }
            .body-content { padding: 20px 8px !important; }
            .resp-card-sq { width: 130px !important; height: 130px !important; margin: 4px !important; display: inline-block !important; }
            .resp-stat { width: 72px !important; height: 72px !important; margin: 3px !important; display: inline-block !important; }
            .resp-step-sq { width: 82px !important; height: 82px !important; margin: 3px !important; display: inline-block !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0;">
        <div class="outer-wrap" style="background-color: ${bgColor}; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px 20px; min-height: 100%;">
          <div class="inner-wrap" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid rgba(0,0,0,0.05);">
            <!-- Header Banner -->
            <div class="hdr-banner" style="background-color: ${accentColor}; padding: 36px 32px; text-align: center;">
              ${logoUrl ? `
                <img src="${logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 12px;" />
              ` : `
                <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.03em;">TuitionEd</h1>
              `}
              <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                ${templateType === 'summer' ? '☀️ Summer Programs' : '🎉 Season of Celebration'}
              </div>
            </div>
            
            <!-- Email Body -->
            <div class="body-content" style="padding: 40px 32px; color: ${textColor}; line-height: 1.8; font-size: 16px;">
              ${htmlContent.replace(/\[Name\]/g, name)}
              
              <!-- Action CTA Buttons -->
              <div style="margin-top: 36px; text-align: center;">
                ${buttonLink ? `
                  <a href="${buttonLink}" target="_blank" style="background-color: ${accentColor}; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; margin: 8px;">
                    ${buttonText || 'Get Started'}
                  </a>
                ` : ''}
                ${buttonLink2 ? `
                  <a href="${buttonLink2}" target="_blank" style="background-color: transparent; color: ${accentColor}; border: 2px solid ${accentColor}; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; margin: 8px;">
                    ${buttonText2 || 'Read More'}
                  </a>
                ` : ''}
              </div>
            </div>
            
            <!-- Footer Details -->
            <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600;">TuitionEd Education Platform</p>
              <p style="margin: 0 0 12px 0;">You received this email because you are registered with TuitionEd.</p>
              <p style="margin: 0; border-top: 1px solid #f3f4f6; padding-top: 12px; font-size: 11px;">
                This is an administrative broadcast. Please do not reply directly.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  };

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setQueueLog(prev => [...prev, { timestamp, type, text }]);
  };

  const runQueue = async () => {
    const total = selectedRecipientsRef.current.length;

    while (queueIndexRef.current < total && queueRunningRef.current) {
      if (queuePausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      const currentEmail = selectedRecipientsRef.current[queueIndexRef.current];
      const recipientInfo = recipients.find(r => r.email === currentEmail);
      const recipientName = recipientInfo ? recipientInfo.fullName : currentEmail;

      addLog(`[${queueIndexRef.current + 1}/${total}] Transmitting email to ${recipientName} (${currentEmail})...`, 'info');

      try {
        const compiledHtml = compileHtml(recipientName);

        const response = await fetch('/api/bulk-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: currentEmail,
            recipientName: recipientName,
            subject: subject,
            htmlContent: compiledHtml,
          }),
        });

        const data = await response.json();

        if (data.success) {
          addLog(`✓ Successfully sent to ${recipientName}!`, 'success');
          setQueueSuccessCount(prev => prev + 1);
        } else {
          addLog(`✗ Failed for ${recipientName}: ${data.message || 'SMTP rejection'}`, 'error');
          setQueueFailedCount(prev => prev + 1);
        }
      } catch (err: any) {
        addLog(`✗ Failed for ${recipientName}: ${err.message || 'Network timeout'}`, 'error');
        setQueueFailedCount(prev => prev + 1);
      }

      // Progress index
      queueIndexRef.current += 1;
      setQueueIndex(queueIndexRef.current);

      // Delay exactly 2 seconds before the next email (unless it was the last one or stopped)
      if (queueIndexRef.current < total && queueRunningRef.current) {
        addLog(`Holding strict 2-second delay before next dispatch...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (queueIndexRef.current >= total && queueRunningRef.current) {
      addLog(`🎉 Campaign broadcast transmission completed successfully!`, 'success');
      toast.success('Broadcast transmission complete!');
      setQueueRunning(false);
      queueRunningRef.current = false;
      fetchStats();
    }
  };

  const handleStartQueue = () => {
    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient.');
      return;
    }
    if (!subject.trim()) {
      toast.error('Campaign Subject is required.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message content is required.');
      return;
    }

    setQueueLog([]);
    setQueueSuccessCount(0);
    setQueueFailedCount(0);
    setQueueIndex(0);
    queueIndexRef.current = 0;

    queueRunningRef.current = true;
    queuePausedRef.current = false;
    setQueueRunning(true);
    setQueuePaused(false);

    addLog(`🚀 Launching transmission queue for ${selectedRecipients.length} recipients...`, 'info');
    runQueue();
  };

  const handlePauseQueue = () => {
    queuePausedRef.current = true;
    setQueuePaused(true);
    addLog('⏸️ Transmission queue paused by admin.', 'info');
  };

  const handleResumeQueue = () => {
    queuePausedRef.current = false;
    setQueuePaused(false);
    addLog('▶️ Resuming transmission queue...', 'info');
  };

  const handleCancelQueue = () => {
    queueRunningRef.current = false;
    setQueueRunning(false);
    queuePausedRef.current = false;
    setQueuePaused(false);
    addLog('⏹️ Transmission queue terminated by admin.', 'error');
    toast.warning('Campaign broadcast cancelled.');
  };

  // Checkbox helpers
  const handleToggleRecipient = (email: string) => {
    setSelectedRecipients(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    setSelectedRecipients(recipients.map(r => r.email));
  };

  const handleDeselectAll = () => {
    setSelectedRecipients([]);
  };

  const filteredRecipients = recipients.filter(r =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGroup = recipientGroups.find(g => g.value === recipientType);

  const presetOptions = [
    { type: 'custom', label: 'Custom Code', icon: <FileCode size={20} />, desc: 'Standard clean email body', accent: '#6366f1' },
    { type: 'summer', label: 'Summer Offer', icon: <Sparkles size={20} />, desc: '☀️ Sun theme for summer promotions', accent: '#f59e0b' },
    { type: 'festival', label: 'Festival Greeting', icon: <Sparkles size={20} />, desc: '🎉 Warm wishes and holiday offers', accent: '#ef4444' }
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex' }}>
                <Mail size={24} />
              </Box>
              <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 800, letterSpacing: '0.15em' }}>
                COMMUNICATIONS ENGINE
              </Typography>
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{ color: 'white', tracking: '-0.04em', mb: 1.5 }}>
              Bulk <span className="text-indigo-500">Messaging</span>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: 700, fontWeight: 500, lineHeight: 1.6 }}>
              Select presets, customize branding styles, preview emails instantly, select specific recipients, and schedule campaigns with safe rate limits.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <Send size={40} />
            </Avatar>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Quick View */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr', lg: 'repeat(7, 1fr)' },
        gap: 3,
        mb: 6
      }}>
        {recipientGroups.map((group, idx) => (
          <motion.div key={group.value} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
            <Box sx={{
              p: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', borderColor: `${group.color}40` }
            }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${group.color}15`, color: group.color, display: 'flex' }}>
                {group.icon}
              </Box>
              <Box sx={{ textCenter: 'center', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.label.split(' ')[0]}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'white' }}>
                  {statsLoading ? <CircularProgress size={16} sx={{ color: group.color }} /> : (stats?.[group.value] || 0)}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Email Builder & Preview Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
        gap: 4,
        mb: 4
      }}>
        {/* Main Composer Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Box sx={{
            p: { xs: 3, md: 5 },
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Template Presets selector */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, letterSpacing: '0.05em' }}>
              SELECT DESIGN PRESET TEMPLATE
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
              {presetOptions.map(option => (
                <Box
                  key={option.type}
                  onClick={() => handleApplyTemplate(option.type as any)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderRadius: 4,
                    bgcolor: templateType === option.type ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid',
                    borderColor: templateType === option.type ? option.accent : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: templateType === option.type ? `0 0 12px ${option.accent}20` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderColor: templateType === option.type ? option.accent : 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: option.accent }}>
                    {option.icon}
                    <Typography fontWeight="800" variant="body2" sx={{ color: 'white' }}>{option.label}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
                    {option.desc}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  CAMPAIGN SUBJECT
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter subject line..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  variant="outlined"
                  sx={textfieldStyles}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  MESSAGE CONTENT (Supports HTML and [Name] Tag)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="Type your message here. Use [Name] to insert recipient names..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  sx={{
                    ...textfieldStyles,
                    '& .MuiOutlinedInput-root': { borderRadius: 3, p: 2.5 },
                    '& .MuiOutlinedInput-input': { color: 'white', lineHeight: 1.7, fontWeight: 500 }
                  }}
                />
              </Box>

              {/* Branding Customization Section */}
              <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: 4, p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Palette size={18} className="text-indigo-400" /> Branding & Call To Action Customizer
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' }, gap: 2, mb: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Logo Image URL"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Image size={15} className="text-gray-500" /></InputAdornment>
                    }}
                    sx={textfieldStyles}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Button 1 Text"
                      placeholder="Claim Now"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      sx={textfieldStyles}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Button 2 Text"
                      placeholder="Read More"
                      value={buttonText2}
                      onChange={(e) => setButtonText2(e.target.value)}
                      sx={textfieldStyles}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Button 1 Link URL"
                    placeholder="https://tuitioned.com/register"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Link2 size={15} className="text-gray-500" /></InputAdornment>
                    }}
                    sx={textfieldStyles}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Button 2 Link URL"
                    placeholder="https://tuitioned.com/online-summer-camp"
                    value={buttonLink2}
                    onChange={(e) => setButtonLink2(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Link2 size={15} className="text-gray-500" /></InputAdornment>
                    }}
                    sx={textfieldStyles}
                  />
                </Box>

                {/* Color Inputs */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, mb: 0.5, display: 'block' }}>ACCENT COLOR</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.02)', p: 0.8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ border: 'none', background: 'none', width: 28, height: 28, cursor: 'pointer', borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{accentColor}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, mb: 0.5, display: 'block' }}>OUTER BG COLOR</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.02)', p: 0.8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ border: 'none', background: 'none', width: 28, height: 28, cursor: 'pointer', borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{bgColor}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, mb: 0.5, display: 'block' }}>TEXT COLOR</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.02)', p: 0.8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ border: 'none', background: 'none', width: 28, height: 28, cursor: 'pointer', borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{textColor}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>
        </motion.div>

        {/* Live Preview Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Box sx={{
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Eye size={18} className="text-indigo-400" /> LIVE COMPILER PREVIEW
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(255,255,255,0.03)', p: 0.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Button
                  size="small"
                  variant={previewMode === 'desktop' ? 'contained' : 'text'}
                  onClick={() => setPreviewMode('desktop')}
                  sx={{
                    minWidth: 70,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: previewMode === 'desktop' ? '#6366f1' : 'transparent',
                    color: 'white',
                    py: 0.3,
                    '&:hover': { bgcolor: previewMode === 'desktop' ? '#4f46e5' : 'rgba(255,255,255,0.05)' }
                  }}
                >
                  Desktop
                </Button>
                <Button
                  size="small"
                  variant={previewMode === 'mobile' ? 'contained' : 'text'}
                  onClick={() => setPreviewMode('mobile')}
                  sx={{
                    minWidth: 70,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: previewMode === 'mobile' ? '#6366f1' : 'transparent',
                    color: 'white',
                    py: 0.3,
                    '&:hover': { bgcolor: previewMode === 'mobile' ? '#4f46e5' : 'rgba(255,255,255,0.05)' }
                  }}
                >
                  Mobile
                </Button>
              </Box>
            </Box>

            {/* Frame Mockup */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              flexGrow: 1,
              alignItems: 'center',
              width: '100%'
            }}>
              <Box sx={{
                width: previewMode === 'desktop' ? '100%' : '340px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
                <Box sx={{ bgcolor: '#1f2937', p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ display: 'flex', gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Box sx={{
                    mx: 'auto',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.4,
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    width: '60%',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {subject || 'No Subject Line Specified'}
                  </Box>
                </Box>
                <iframe
                  srcDoc={previewHtml}
                  title="Live Compiled Preview"
                  style={{
                    width: '100%',
                    height: '475px',
                    border: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ mt: 1.5, color: 'rgba(255,255,255,0.3)', display: 'block', textAlign: 'center' }}>
              ℹ Live compiler replaces <b>[Name]</b> placeholder with a sample name (<b>John Doe</b>).
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Target Recipient Selection & Control Engine Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' },
        gap: 4
      }}>
        {/* Recipient Selector Block */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Box sx={{
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Recipient selection input */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, letterSpacing: '0.05em' }}>
              TARGET RECIPIENT GROUP
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  color: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                  '& .MuiSelect-select': { py: 1.8, px: 2.5 }
                }}
                renderValue={(selected) => {
                  if (!selected) return <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontWeight: 500 }}>Select target cohort to load recipients list...</span>;
                  const group = recipientGroups.find(g => g.value === selected);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: group?.color }}>{group?.icon}</Box>
                      <Typography sx={{ fontWeight: 700 }}>{group?.label}</Typography>
                      {stats && <Badge variant="outline" className="ml-auto bg-white/5 border-white/10 text-gray-400 font-bold px-3">{(stats as any)[selected as string] || 0} active</Badge>}
                    </Box>
                  );
                }}
              >
                {recipientGroups.map((group) => (
                  <MenuItem key={group.value} value={group.value} sx={{ py: 1.5, px: 2.5 }}>
                    <ListItemIcon sx={{ color: group.color }}>{group.icon}</ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight="700">{group.label}</Typography>}
                      secondary={stats ? `${stats[group.value] || 0} registered recipients` : 'Calculating...'}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 3 }} />

            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, mb: 2, letterSpacing: '0.05em' }}>
              RECIPIENT SELECTOR ({selectedRecipients.length} / {recipients.length} Selected)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2.5 }}>
              <TextField
                size="small"
                placeholder="Filter by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={15} className="text-gray-500" /></InputAdornment>
                }}
                sx={{ ...textfieldStyles, flexGrow: 1 }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  disabled={recipients.length === 0}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  Check All
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  disabled={recipients.length === 0}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Box>

            {/* List box */}
            {recipientsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={32} sx={{ color: '#6366f1' }} />
              </Box>
            ) : recipients.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.3 }}>
                <Users size={36} style={{ margin: '0 auto 12px' }} />
                <Typography variant="body2" fontWeight="700">No recipients loaded</Typography>
                <Typography variant="caption">Select group from dropdown to list active contacts.</Typography>
              </Box>
            ) : (
              <Box sx={{
                maxHeight: '280px',
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 3,
                bgcolor: 'rgba(0,0,0,0.1)',
                p: 1
              }}>
                <Stack spacing={0.5}>
                  {filteredRecipients.map((rec) => {
                    const isSelected = selectedRecipients.includes(rec.email);
                    return (
                      <Box
                        key={rec.email}
                        onClick={() => handleToggleRecipient(rec.email)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          border: '1px solid',
                          borderColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)'
                          },
                          transition: 'all 0.15s'
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => { }} // Box onClick does toggle
                          sx={{
                            color: 'rgba(255,255,255,0.2)',
                            '&.Mui-checked': { color: '#6366f1' },
                            p: 0.5,
                            mr: 1.5
                          }}
                        />
                        <Avatar sx={{ width: 28, height: 28, fontSize: '11px', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {rec.fullName.charAt(0)}
                        </Avatar>
                        <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
                          <Typography variant="body2" fontWeight="700" sx={{ color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {rec.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px' }}>
                            {rec.email}
                          </Typography>
                        </Box>

                        <Box sx={{ ml: 'auto' }}>
                          {rec.role === 'teacher' ? (
                            <Badge variant="outline" className={`font-bold px-2 py-0.5 border-none text-[9px] ${rec.teacherStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {rec.teacherStatus === 'approved' ? 'Approved' : 'Pending'}
                            </Badge>
                          ) : rec.role === 'student' ? (
                            <Badge variant="outline" className={`font-bold px-2 py-0.5 border-none text-[9px] ${rec.studentStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {rec.studentStatus === 'approved' ? 'Approved' : 'Pending'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-bold px-2 py-0.5 border-none text-[9px] bg-indigo-500/10 text-indigo-400">
                              Unverified
                            </Badge>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Transmission Engine Control Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Box sx={{
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800, mb: 3, letterSpacing: '0.05em' }}>
              TRANSMISSION BROADCAST ENGINE
            </Typography>

            {!queueRunning && queueIndex === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', opacity: 0.8, py: 2 }}>
                  <Send size={44} className="text-indigo-400" style={{ margin: '0 auto 16px' }} />
                  <Typography variant="h6" fontWeight="900" color="white" gutterBottom>
                    Engine Status: Ready
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 320, mx: 'auto', mb: 2 }}>
                    Press below to trigger queue processing. Each email will be sent sequentially with a mandatory 2-second rate-limiting delay to prevent spam flags.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleStartQueue}
                  disabled={selectedRecipients.length === 0}
                  sx={{
                    py: 1.8,
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 12px 24px -10px rgba(79, 70, 229, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                      transform: 'translateY(-2px)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      color: 'rgba(255,255,255,0.2)'
                    }
                  }}
                  startIcon={<Send size={18} />}
                >
                  Send Broadcast to {selectedRecipients.length} Recipient{selectedRecipients.length !== 1 ? 's' : ''}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1 }}>
                {/* Stats board */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1.2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '9px' }}>QUEUE</Typography>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 900 }}>{selectedRecipients.length}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1.2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '9px' }}>DISPATCHED</Typography>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 900 }}>{queueIndex}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.03)', p: 1.2, borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.12)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: '9px' }}>SUCCESS</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#10b981', fontWeight: 900 }}>{queueSuccessCount}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.03)', p: 1.2, borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.12)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '9px' }}>FAILED</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#ef4444', fontWeight: 900 }}>{queueFailedCount}</Typography>
                  </Box>
                </Box>

                {/* Progress Indicators */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                      {queueIndex === selectedRecipients.length ? 'Transmission Complete' : queuePaused ? 'Queue Paused' : 'Broadcasting...'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 800 }}>
                      {Math.round((queueIndex / selectedRecipients.length) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(queueIndex / selectedRecipients.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.04)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: queueIndex === selectedRecipients.length ? '#10b981' : queuePaused ? '#f59e0b' : '#6366f1',
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>

                {/* Control Panel buttons */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {queueRunning && !queuePaused && (
                    <Button
                      onClick={handlePauseQueue}
                      variant="contained"
                      sx={{
                        flexGrow: 1,
                        bgcolor: '#f59e0b',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#d97706' }
                      }}
                      startIcon={<Pause size={14} />}
                    >
                      Pause
                    </Button>
                  )}
                  {queueRunning && queuePaused && (
                    <Button
                      onClick={handleResumeQueue}
                      variant="contained"
                      sx={{
                        flexGrow: 1,
                        bgcolor: '#10b981',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                      startIcon={<Play size={14} />}
                    >
                      Resume
                    </Button>
                  )}
                  {queueRunning && (
                    <Button
                      onClick={handleCancelQueue}
                      variant="outlined"
                      sx={{
                        flexGrow: 1,
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(239,68,68,0.05)', borderColor: '#dc2626' }
                      }}
                      startIcon={<Square size={14} />}
                    >
                      Stop
                    </Button>
                  )}
                  {!queueRunning && queueIndex === selectedRecipients.length && (
                    <Button
                      onClick={() => {
                        setQueueIndex(0); // Reset UI to ready state
                      }}
                      variant="contained"
                      sx={{
                        flexGrow: 1,
                        bgcolor: '#6366f1',
                        color: 'white',
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#4f46e5' }
                      }}
                      startIcon={<RefreshCw size={14} />}
                    >
                      Done / Reset
                    </Button>
                  )}
                </Box>

                {/* Real-time terminal log pane */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 0.8, letterSpacing: '0.05em' }}>
                    TRANSMISSION ENGINE STATUS LOG
                  </Typography>
                  <Box
                    ref={logContainerRef}
                    sx={{
                      flexGrow: 1,
                      maxHeight: '180px',
                      minHeight: '140px',
                      bgcolor: '#0a0f1d',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      p: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8
                    }}
                  >
                    {queueLog.length === 0 ? (
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>Engine idle. No activities logged.</span>
                    ) : (
                      queueLog.map((log, index) => {
                        const logColor = log.type === 'success' ? '#10b981' : log.type === 'error' ? '#ef4444' : '#818cf8';
                        return (
                          <div key={index} style={{ lineBreak: 'anywhere' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '6px' }}>[{log.timestamp}]</span>
                            <span style={{ color: logColor }}>{log.text}</span>
                          </div>
                        );
                      })
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
