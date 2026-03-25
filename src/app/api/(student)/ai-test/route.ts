import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const systemPrompt = `You are "Ed", a fun and friendly AI learning buddy for the TuitionEd platform, designed to talk to children and their parents.

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
- Be the "TuitionEd Buddy".
- Answer questions about our platform, how to use the website, our courses, and tutors.
- Get kids excited to try a free class.
- Explain technical steps (like logging in or finding classes) in a super simple, step-by-step, fun way.
- Use simple words and short sentences.

Keep your answers short, fun, and always about TuitionEd. If a user asks about something else, giggle and say something like "Oopsie! That's a grown-up question. Let's talk about our awesome classes instead! 🚀".
If the user's message is very short (e.g., one or two words), keep your response extra short and playful. For example, if they just say "Hi", you can say "Heya! 👋 What's on your mind, friend?".`;

let lastWorkingModel = "gemini-1.5-flash";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const isJsonMode = message.includes("Return the response as a valid JSON array");

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API Key is not configured." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Priority list: Put the fastest model (1.5-flash) and the last working one at the top
        const modelNames = Array.from(new Set([lastWorkingModel, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]));
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                console.log(`>>> Attempting AI response with: ${modelName}`);
                const modelConfig: any = { model: modelName };
                if (isJsonMode) {
                    modelConfig.systemInstruction = "You are a helpful assistant that generates educational multiple choice questions. Always respond with valid JSON only, no additional text, personality, or formatting.";
                }
                const model = genAI.getGenerativeModel(modelConfig);

                let result;
                if (isJsonMode) {
                    // For JSON generation, use direct content generation
                    result = await model.generateContent(message);
                } else {
                    // For chat, use conversation history
                    const chat = model.startChat({
                        history: [
                            {
                                role: "user",
                                parts: [{ text: systemPrompt }],
                            },
                            {
                                role: "model",
                                parts: [{ text: "Got it! I'm Ed, your super fun learning buddy! What adventure shall we go on today? ✨" }],
                            },
                            // Limit history to last 10 messages for maximum speed
                            ...(history || []).slice(-10).map((msg: any) => ({
                                role: msg.role === "user" ? "user" : "model",
                                parts: [{ text: msg.content }],
                            })),
                        ],
                    });
                    result = await chat.sendMessage(message);
                }

                const response = await result.response;
                const text = response.text();

                if (text) {
                    console.log(`>>> Success with model: ${modelName}`);
                    lastWorkingModel = modelName; // Save for next time
                    return NextResponse.json({ text });
                }
            } catch (err: any) {
                console.warn(`>>> Model ${modelName} failed:`, err.message);
                lastError = err;
                continue;
            }
        }

        throw lastError || new Error("All AI models failed to respond. Please check your API key.");
    } catch (error: any) {
        console.error("Chatbot API Final Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get response from AI." },
            { status: 500 }
        );
    }
}