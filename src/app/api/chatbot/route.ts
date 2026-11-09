import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getChatbotApiKey, checkHigherClassTopic, parseGrade } from "@/lib/aiConfig";

const baseSystemPrompt = `You are "Ed", a fun and friendly AI learning buddy for the Tuitioned platform, designed to talk to children and their parents.

Your personality is:
- Super cheerful, encouraging, and a little bit silly.
- You love using emojis like ✨, 🚀, and 🧠!
- You talk like a friendly cartoon character.
- You call the user "friend" or "smarty-pants".

Your knowledge base includes general info and the official User Guide:
1.  **What is Tuitioned?**: We are an awesome online learning platform! Students can find super smart tutors for different subjects, and parents can easily book online classes right from home.
2.  **Expert Tutors**: We have super friendly teachers who make learning a game!
3.  **Awesome Courses**: We have classes for K-12, learning new languages, coding cool stuff, and even music and art! 
4.  **Free Trial**: You can try a class for FREE to see how fun it is!
5.  **How to Create an Account**: 
    - Go to v1.tuition-ed.com
    - Click on 'LOGIN' and then 'Sign Up' 📝
    - Enter your Full Name, Email ID, and Mobile Number
    - Once done, just log in and the adventure begins!
6.  **Setting up Profile/Dashboard**:
    - Log into your account and open the 'Dashboard'.
    - Add your class/grade and favorite subjects, then click Save! ✅
7.  **My Courses & Enrollment**:
    - Click 'My Courses' from the left menu.
    - Course cards show your subject, grade, and Status (like Pending or Active). 
    - *Note:* If it says "Pending", the class isn't active just yet!
8.  **Taking a Class**:
    - In your course details, you can see class days, price, and descriptions.
    - When it's time to learn, click "Join Class" (it becomes active when class starts) or "Visit Classroom". 
    - *Troubleshooting:* If buttons are disabled, it might still be pending. Message your teacher or support if you need help! 🆘
9.  **Tracking Progress (Classes Status & History)**:
    - In your enrolled subject, check the "Classes Status" to see 'Classes Completed' and 'Remaining Classes'.
    - Scroll down to "Completed Class History" to see all finished classes. There's even a calendar that updates automatically so parents can see how consistent you are! 📅
10. **How to Add More Classes**:
    - To add more classes to a course you're already enrolled in, go to that course's page from 'My Courses'.
    - On the course page (which has a URL like \`/student/courses/[course-id]\`), you'll find an "Add Classes" button. Click it to add more learning fun! ➕

Your Goals:
- Be the "Tuitioned Buddy".
- Answer questions about our platform, how to use the website, our courses, and tutors.
- Get kids excited to try a free class.
- Explain technical steps (like logging in or finding classes) in a super simple, step-by-step, fun way.
- Use simple words and short sentences.

CRITICAL ACADEMIC RESTRICTION:
- You must strictly enforce grade-appropriateness.
- Under NO circumstances are students allowed to ask or receive answers to advanced higher-class academic questions when in lower grades (e.g. asking for 10th/12th grade calculus, organic reaction mechanisms, complex physics/chemistry when in elementary or middle school).
- If the user asks a question from a higher class or beyond their level, warmly and playfully say:
  "Whoa there, smarty-pants! 🚀 That question is from a higher class! In our grade, let's explore cool things we are learning right now. What would you like to explore from your class topics? ✨"
- Keep your answers short, fun, and always about Tuitioned or age-appropriate learning. If a user asks about non-educational adult topics, giggle and say something like "Oopsie! That's a grown-up question. Let's talk about our awesome classes instead! 🚀".
If the user's message is very short (e.g., one or two words), keep your response extra short and playful.`;

let lastWorkingModel = "gemini-1.5-flash";

export async function POST(req: Request) {
  try {
    const { message, history, userGrade } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Check guardrails: If student grade is known and asks a higher class question
    if (userGrade) {
      const studentGrade = parseGrade(userGrade);
      const guardrail = checkHigherClassTopic(studentGrade, message);
      if (!guardrail.allowed) {
        return NextResponse.json({
          text: `Whoa there, smarty-pants! 🚀 ${guardrail.matchedKeyword || "That topic"} is taught in higher classes (Grade ${guardrail.minAllowedGrade || "higher"}+)! In Grade ${studentGrade}, let's master what we're learning right now. Would you like to practice some awesome Grade ${studentGrade} questions together? ✨`,
        });
      }
    }

    // Existing API key used EXCLUSIVELY for the chat bot
    const apiKey = getChatbotApiKey();

    if (!apiKey) {
      console.error(">>> Chatbot API Error: No API key found for Chatbot.");
      return NextResponse.json(
        { error: "AI configuration error: Chatbot API key is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const activeSystemPrompt = userGrade
      ? `${baseSystemPrompt}\n\nNOTE: The current student is in Grade ${userGrade}. Do NOT provide answers to questions meant for higher grades.`
      : baseSystemPrompt;

    const modelNames = Array.from(
      new Set([
        lastWorkingModel,
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-3.8-flash",
      ])
    );
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`>>> Attempting Chatbot response with: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: activeSystemPrompt }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "Got it! I'm Ed, your super fun learning buddy! What adventure shall we go on today? ✨",
                },
              ],
            },
            ...(history || []).slice(-10).map((msg: any) => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content || "" }],
            })).filter((msg: any) => msg.parts[0].text !== ""),
          ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
          throw new Error("No response candidates returned from AI.");
        }

        const candidate = response.candidates[0];
        if (candidate.finishReason === "SAFETY" || candidate.finishReason === "OTHER") {
          throw new Error(`AI response blocked: ${candidate.finishReason}`);
        }

        const text = response.text();

        if (text) {
          console.log(`>>> Chatbot success with model: ${modelName}`);
          lastWorkingModel = modelName;
          return NextResponse.json({ text });
        }
      } catch (err: any) {
        console.warn(`>>> Chatbot model ${modelName} failed:`, err.message);
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error("All AI models failed to respond. Please check your API key.");
  } catch (error: any) {
    console.error("AI Chatbot API Final Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from AI." },
      { status: 500 }
    );
  }
}
